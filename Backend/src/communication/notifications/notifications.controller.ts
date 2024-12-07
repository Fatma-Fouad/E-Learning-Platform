import { ChatService } from './../chats/chats.service';
import { Controller, Get, Post, Param, Body, Put, BadRequestException, Query } from '@nestjs/common';
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

//platformwide notifications
    @Post('platform')
    async sendPlatformNotificationToAllUsers(@Body('content') content: string) {
        if (!content) {
            throw new BadRequestException('Notification content is required.');
        }

        try {
            await this.notificationService.sendPlatformNotificationToAllUsers(content);
            return { success: true, message: 'Platform notification sent to all users.' };
        } catch (error) {
            console.error('Error in sendPlatformNotification:', error.message);
            throw new BadRequestException('Failed to send platform notification.');
        }
    }

    //
    @Get(':userId')
    async getUserNotifications(
        @Param('userId') userId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        try {
            return await this.notificationService.getUserNotifications(userId, page, limit);
        } catch (error) {
            throw new BadRequestException('Failed to retrieve notifications.');
        }
    }



    @Get(':userId/unread')
    async getUnreadNotifications(@Param('userId') userId: string) {
        try {
            return await this.notificationService.getUnreadNotifications(userId);
        } catch (error) {
            console.error(`Error fetching unread notifications for user ${userId}:`, error.message);
            throw new BadRequestException('Failed to retrieve unread notifications.');
        }
    }

    @Put(':notificationId/read')
    async markNotificationAsRead(@Param('notificationId') notificationId: string) {
        try {
            return await this.notificationService.markNotificationAsRead(notificationId);
        } catch (error) {
            console.error(`Error marking notification ${notificationId} as read:`, error.message);
            throw new BadRequestException('Failed to mark notification as read.');
        }
    }

    @Put(':userId/read-all')
    async markAllNotificationsAsRead(@Param('userId') userId: string) {
        try {
            return await this.notificationService.markAllNotificationsAsRead(userId);
        } catch (error) {
            console.error(`Error marking all notifications as read for user ${userId}:`, error.message);
            throw new BadRequestException('Failed to mark all notifications as read.');
        }
    }

    @Get(':userId/type')
    async getNotificationsByType(
        @Param('userId') userId: string,
        @Query('type') type: string
    ) {
        try {
            if (!userId || !type) {
                throw new BadRequestException('User ID and type are required.');
            }

            // Validate the type
            const validTypes = ['message', 'reply', 'course-update', 'platform'];
            if (!validTypes.includes(type)) {
                throw new BadRequestException(`Invalid notification type. Valid types are: ${validTypes.join(', ')}`);
            }

            const notifications = await this.notificationService.getNotificationsByType(userId, type);
            return {
                message: `Notifications of type "${type}" retrieved successfully for user ${userId}.`,
                notifications,
            };
        } catch (error) {
            throw new BadRequestException(error.message || 'Failed to retrieve notifications by type.');
        }
    }




}
