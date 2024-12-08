import { ChatSchema } from './chats.schema';
import { Controller, Get, Post, Param, Body, Delete, Query, NotFoundException, BadRequestException, ForbiddenException, UseGuards } from '@nestjs/common';
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
    @UseGuards(AuthGuard, RolesGuard) 
    @Roles('admin' as Role)
    async getAllChats() {
        return this.chatService.getAllChats();
    }

    // Create a new chat (Access: Instructor, Admin, Student)
    @Post('create')
    @UseGuards(AuthGuard) 
    async createChat(
        @Body() body: { chatName: string; participants: string[]; courseId: string }
    ) {
        const { chatName, participants, courseId } = body;

        // Validate courseId
        if (!mongoose.isValidObjectId(courseId)) {
            throw new BadRequestException('Invalid course ID');
        }

        return this.chatService.createChat(chatName, participants, courseId);
    }

    // Search chats by query (Access: Student, Instructor, Admin)
    @Get('search')
    @UseGuards(AuthGuard) 
    async searchChats(@Query('q') searchTerm: string) {
        if (!searchTerm || searchTerm.trim() === '') {
            throw new BadRequestException('Search term is required');
        }
        return this.chatService.searchChats(searchTerm);
    }

    // Get chats by course ID (Access: Instructor, Admin)
    @Get('course/:courseId')
    @UseGuards(AuthGuard, RolesGuard) 
  @Roles('instructor' as Role, 'admin' as Role)
    async getChatsByCourse(@Param('courseId') courseId: string) {
        if (!mongoose.isValidObjectId(courseId)) {
            throw new BadRequestException('Invalid course ID');
        }

        return this.chatService.getChatsByCourse(courseId);
    }

    // Delete a chat (Access: Admin, User who created the chat)
    @Delete(':id')
    @UseGuards(AuthGuard) 
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
    @UseGuards(AuthGuard) 
    async addMessage(
        @Param('id') chatId: string,
        @Body() messageData: { sender: string; content: string }
    ) {
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
    }

    // Get chat history (Access: Student, Instructor, Admin)
    @Get(':chatId/messages')
    @UseGuards(AuthGuard) 
    async getChatHistory(@Param('chatId') chatId: string) {
        console.log(`Fetching messages for chatId: ${chatId}`);
        const messages = await this.chatService.getChatHistory(chatId);
        console.log(`Fetched messages:`, messages);
        return messages;
    }
}
