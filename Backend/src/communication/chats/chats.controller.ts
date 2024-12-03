import { Controller, Get, Post, Param, Body, Delete, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import { ChatService } from './chats.service';
import mongoose from 'mongoose';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {

        console.log('ChatController initialized');
    }

    @Get()
    async getAllChats() {
        return this.chatService.getAllChats();
    }

    @Post('create')
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




    // Search chats by query
    @Get('search')
    async searchChats(@Query('q') searchTerm: string) {
        if (!searchTerm || searchTerm.trim() === '') {
            throw new BadRequestException('Search term is required');
        }
        return this.chatService.searchChats(searchTerm);
    }

    @Get('course/:courseId')
    async getChatsByCourse(@Param('courseId') courseId: string) {
        if (!mongoose.isValidObjectId(courseId)) {
            throw new BadRequestException('Invalid course ID');
        }

        return this.chatService.getChatsByCourse(courseId);
    }



    @Delete(':id')
    async deleteChat(@Param('id') id: string) {
        const chat = await this.chatService.deleteChat(id);
        if (!chat) {
            throw new NotFoundException(`Chat with ID ${id} not found`);
        }
        return chat;
    }


    @Post('message/:id')
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

    //chat history
    @Get(':chatId/messages')
    async getChatHistory(@Param('chatId') chatId: string) {
        console.log(`Fetching messages for chatId: ${chatId}`);
        const messages = await this.chatService.getChatHistory(chatId);
        console.log(`Fetched messages:`, messages);
        return messages;
    }



}

