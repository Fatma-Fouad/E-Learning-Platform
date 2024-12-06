
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Notification, NotificationDocument } from './notifications.schema';
import { NotificationGateway } from './notificationGateway';
import { User, UserSchema } from '../../users/user.schema';
import { Injectable, Inject, forwardRef } from '@nestjs/common';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
        @InjectModel(User.name) private userModel: Model<User>,
        @Inject(forwardRef(() => NotificationGateway)) // Resolving circular dependency
        private readonly notificationGateway: NotificationGateway,
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

    async createPlatformNotification(content: string): Promise<NotificationDocument> {
        if (!content) {
            throw new Error('Content is required for platform-wide notification');
        }

        const notification = new this.notificationModel({
            type: 'platform',
            content,
            userId: null, // No specific user; applies to all
            chatId: null, // No chat context
        });

        return notification.save();
    }

    async sendPlatformNotificationToAllUsers(content: string): Promise<void> {
        try {
            // Fetch all user IDs from the database
            const users = await this.userModel.find({}, { _id: 1 }).exec();
            if (!users || users.length === 0) {
                throw new Error('No users found in the database.');
            }

            console.log('Users to notify:', users.map((user) => user._id.toString()));

            // Loop through each user and send a notification
            for (const user of users) {
                const roomName = `user:${user._id}`;
                const notification = {
                    type: 'platform',
                    content,
                    timestamp: new Date(),
                };

                // Emit notification to the WebSocket room
                this.notificationGateway.server.to(roomName).emit('platformNotification', notification);

                // Save the notification in the database
                const newNotification = new this.notificationModel({
                    userId: user._id,
                    type: 'platform',
                    content,
                });
                await newNotification.save();

                console.log(`Notification sent to user: ${user._id}`);
            }
        } catch (error) {
            console.error('Error sending platform notification:', error.message);
            throw new Error('Failed to send platform notification.');
        }
    }

    //retrieves all notifications for a specific user
    //Handle large datasets efficiently
    async getUserNotifications(userId: string, page: number, limit: number): Promise<{ notifications: Notification[], total: number }> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid user ID');
        }

        const total = await this.notificationModel.countDocuments({ userId }).exec();
        const notifications = await this.notificationModel
            .find({ userId })
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        return { notifications, total };
    }

    //To fetch only unread notifications
    async getUnreadNotifications(userId: string): Promise<Notification[]> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid user ID');
        }

        return this.notificationModel
            .find({ userId: new mongoose.Types.ObjectId(userId), read: false })
            .sort({ timestamp: -1 })
            .exec();
    }


    //Mark a Notification as Read
    async markNotificationAsRead(notificationId: string): Promise<Notification> {
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            throw new Error('Invalid notification ID');
        }

        return this.notificationModel.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true } // Return the updated document
        ).exec();
    }

    //Mark All Notifications as Read
    async markAllNotificationsAsRead(userId: string): Promise<any> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid user ID');
        }

        return this.notificationModel.updateMany(
            { userId: new mongoose.Types.ObjectId(userId), read: false },
            { $set: { read: true } }
        ).exec();
    }

    //Allow users to filter and view specific types of notifications.
    async getNotificationsByType(userId: string, type: string): Promise<Notification[]> {
        return this.notificationModel.find({ userId, type }).sort({ timestamp: -1 }).exec();
    }



}


