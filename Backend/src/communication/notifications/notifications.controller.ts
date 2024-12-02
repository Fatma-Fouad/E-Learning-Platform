import { ChatService } from './../chats/chats.service';
import { Controller, Get, Post, Param, Body, Put } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notificationGateway';
import mongoose from 'mongoose';

@Controller('notifications')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly notificationGateway: NotificationGateway,
        private readonly chatService: ChatService // Inject the ChatService

    ) { }

    @Get(':userId')
    async getNotifications(@Param('userId') userId: string) {
        return this.notificationService.getNotifications(userId);
    }

    @Put(':notificationId/read')
    async markAsRead(@Param('notificationId') notificationId: string) {
        return this.notificationService.markAsRead(notificationId);
    }

    @Post()
    async createNotification(
        @Body('userId') userId: string,
        @Body('type') type: string,
        @Body('content') content: string,
        @Body('chatId') chatId?: string, // Optional chatId
    ) {
        if (!userId || !type || !content) {
            throw new Error('Missing required fields: userId, type, or content.');
        }

        // Call the service method to create the notification
        return this.notificationService.createNotification(userId, type, content, chatId);
    }



    @Post('test-notification')
    async testNotification(@Body() body: { chatId: string; userId: string; type: string; content: string }) {
        const { chatId, userId, type, content } = body;

        try {
            // Validate chatId
            if (!mongoose.Types.ObjectId.isValid(chatId)) {
                throw new Error(`Invalid chatId: ${chatId}`);
            }

            const chatObjectId = new mongoose.Types.ObjectId(chatId);

            // Fetch chat and participants
            const chat = await this.chatService.getChatById(chatObjectId);
            if (!chat || !chat.participants || chat.participants.length === 0) {
                throw new Error('No participants found in the chat.');
            }

            console.log('Chat participants:', chat.participants);

            // Filter out the sender
            const userIds = chat.participants
                .map((id) => id.toString()) // Convert to strings
                .filter((id) => id !== userId); // Exclude sender

            console.log(`Users to notify (excluding sender ${userId}):`, userIds);

            if (userIds.length === 0) {
                console.log('No other users to notify.');
                return { success: false, message: 'No other users to notify.' };
            }

            // Send notifications
            await this.notificationGateway.sendNotification(userIds, type, content, userId, chatId);

            return { success: true, message: 'Notification sent to all other users in the room' };
        } catch (error) {
            console.error('Error in testNotification:', error.message);
            return { success: false, message: error.message };
        }
    }





}

