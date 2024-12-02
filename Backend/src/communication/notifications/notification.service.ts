import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Notification, NotificationDocument } from './notifications.schema';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    ) { }

    async createNotification(
        userId: string,
        type: string,
        content: string,
        chatId: string, // Required chatId parameter
    ) {
        if (!userId || !type || !content || !chatId) {
            throw new Error('Missing required fields for notification creation');
        }

        // Validate `chatId` as a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            throw new Error(`Invalid chatId: ${chatId}`);
        }

        // Validate `userId` as a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error(`Invalid userId: ${userId}`);
        }

        // Create the notification object
        const notification = new this.notificationModel({
            userId: new mongoose.Types.ObjectId(userId), // Convert userId to ObjectId
            type,
            content,
            chatId: new mongoose.Types.ObjectId(chatId), // Convert chatId to ObjectId
        });

        return notification.save();
    }


    async getNotifications(userId: string) {
        try {
            return this.notificationModel
                .find({ userId })
                .sort({ timestamp: -1 })
                .exec();
        } catch (error) {
            console.error(`Error fetching notifications for user ${userId}:`, error.message);
            throw new Error('Failed to fetch notifications');
        }
    }


    async markAsRead(notificationId: string) {
        return this.notificationModel.findByIdAndUpdate(notificationId, { read: true }).exec();
    }
}
