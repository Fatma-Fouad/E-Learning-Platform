import { Chat, ChatDocument, Message } from './chats.schema';
import { Controller, Get, Post, Param, Body, Delete, Query, NotFoundException, BadRequestException, ForbiddenException, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chats.service';
import mongoose from 'mongoose';
import { AuthGuard } from 'src/authentication/auth.guard';
import { Roles, Role } from 'src/authentication/roles.decorator';
import { RolesGuard } from 'src/authentication/roles.guard';



@Controller('chat')
    
export class ChatController {
    constructor(private readonly chatService: ChatService) {

        console.log('ChatController initialized');
    }

    // Get all chats (Access: Admin)
    @Get()

    async getAllChats() {
        return this.chatService.getAllChats();
    }
    @Post('mixed')
    async createMixedChat(
        @Body('chatName') chatName: string,
        @Body('participantIds') participantIds: string[],
        @Body('courseId') courseId: string,
        @Body('userId') userId: string // Add userId for testing
    ) {
        if (!userId) {
            throw new BadRequestException('User ID is missing.');
        }

        // Validate the user role
        const user = await this.chatService.getUserFromDatabase(userId);
        if (!user || user.role !== 'instructor') {
            throw new ForbiddenException('Only instructors can create mixed chats.');
        }

        return this.chatService.createChat(chatName, participantIds, courseId, userId);
    }



    // Create a one-to-one student-only chat
    @Post('student')
    async createStudentChat(
        @Body('chatName') chatName: string,
        @Body('participantId') participantId: string, // Single participant ID
        @Body('courseId') courseId: string,
        @Body('userId') userId: string
    ) {
        if (!userId) {
            throw new BadRequestException('User ID is missing.');
        }

        // Validate the user who is creating the chat
        const creator = await this.chatService.getUserFromDatabase(userId);
        if (!creator || creator.role !== 'student') {
            throw new ForbiddenException('Only students can create one-to-one chats.');
        }

        // Validate the participant
        const participant = await this.chatService.getUserFromDatabase(participantId);
        if (!participant || participant.role !== 'student') {
            throw new BadRequestException(
                `Participant with ID ${participantId} is not a valid student.`
            );
        }

        // Ensure it's a one-to-one chat
        const participantIds = [userId, participantId];
        console.log('Creating a one-to-one student-only chat...');

        // Create the chat
        return this.chatService.createChat(chatName, participantIds, courseId, userId);
    }

    // Create a group chat
    @Post('group')
    async createGroupChat(
        @Body('chatName') chatName: string,
        @Body('participantIds') participantIds: string[], // Array of participant IDs
        @Body('courseId') courseId: string,
        @Body('userId') userId: string
    ) {
        if (!userId) {
            throw new BadRequestException('User ID is missing.');
        }

        // Validate the user who is creating the chat
        const creator = await this.chatService.getUserFromDatabase(userId);
        if (!creator || creator.role !== 'student') {
            throw new ForbiddenException('Only students can create group chats.');
        }

        // Ensure at least one participant is provided
        if (!participantIds || participantIds.length === 0) {
            throw new BadRequestException('At least one participant is required for a group chat.');
        }

        // Validate each participant
        for (const participantId of participantIds) {
            const participant = await this.chatService.getUserFromDatabase(participantId);
            if (!participant || participant.role !== 'student') {
                throw new BadRequestException(
                    `Participant with ID ${participantId} is not a valid student.`
                );
            }
        }

        // Ensure the creator is part of the group chat
        const allParticipantIds = [...new Set([userId, ...participantIds])];
        console.log('Creating a group chat with participants:', allParticipantIds);

        // Create the chat
        return this.chatService.createChat(chatName, allParticipantIds, courseId, userId);
    }



    // Search chats by query (Access: Student, Instructor, Admin)
    @Get('search')
  //  @UseGuards(AuthGuard) 
    async searchChats(@Query('q') searchTerm: string) {
        if (!searchTerm || searchTerm.trim() === '') {
            throw new BadRequestException('Search term is required');
        }
        return this.chatService.searchChats(searchTerm);
    }

  


    @Get('course/:courseId')
        //@UseGuards(AuthGuard, RolesGuard)
        //@Roles('instructor' as Role, 'admin' as Role)
    async getChatsByCourse(
        @Param('courseId') courseId: string,
        @Query('userId') userId: string
    ) {
        if (!mongoose.isValidObjectId(courseId)) {
            throw new BadRequestException('Invalid course ID');
        }

        if (!userId) {
            throw new BadRequestException('User ID is required.');
        }

        // Validate user existence
        const user = await this.chatService.getUserFromDatabase(userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found.`);
        }

        const chats = await this.chatService.getChatsByCourse(courseId);

        // Filter chats based on user role
        if (user.role === 'instructor') {
            return chats.filter(chat => chat.type === 'mixed'); // Instructors see only mixed chats
        }
        return chats; // Students see all chats
    }



    // Delete a chat (Access: Admin, User who created the chat)
    @Delete(':id')
   // @UseGuards(AuthGuard) 
    async deleteChat(@Param('id') id: string, @Query('userId') userId: string) {
        // Fetch the chat by ID to verify if the user is the creator
        const chat = await this.chatService.getChatById(id);

        if (!chat) {
            throw new NotFoundException(`Chat with ID ${id} not found`);
        }

        // Check if the current user is the creator of the chat
        if (chat.creatorId.toString() !== userId) {
            throw new ForbiddenException('You are not authorized to delete this chat');
        }

        // Proceed to delete the chat if the user is the creator
        return this.chatService.deleteChat(id);
    }


    // Add a message to a chat (Access: Student, Instructor, Admin)
    @Post('message/:id')
        //@UseGuards(AuthGuard) 
    async addMessage(
        @Param('id') chatId: string,
        @Body() messageData: { sender: string; content: string }
    ) {
        try {
            console.log('Chat ID:', chatId);
            console.log('Message Data:', messageData);

            if (!mongoose.isValidObjectId(chatId)) {
                throw new BadRequestException('Invalid chat ID');
            }
            if (!messageData.sender || !mongoose.isValidObjectId(messageData.sender)) {
                throw new BadRequestException('Invalid sender ID');
            }
            if (!messageData.content || typeof messageData.content !== 'string') {
                throw new BadRequestException('Content must be a valid string');
            }

            return this.chatService.addMessage(chatId, messageData);
        } catch (error) {
            console.error('Error in addMessage:', error.message);
            throw error;
        }
    }


    // Get chat history (Access: Student, Instructor, Admin)
    @Get(':chatId/messages')
    //@UseGuards(AuthGuard) 
    async getChatHistory(@Param('chatId') chatId: string) {
        console.log(`Fetching messages for chatId: ${chatId}`);
        const messages = await this.chatService.getChatHistory(chatId);
        console.log(`Fetched messages:`, messages);
        return messages;
    }
}
