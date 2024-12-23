import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';
import { forwardRef, Inject } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*', // Allow cross-origin requests (configure for production)
    },
})
export class NotificationGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        @Inject(forwardRef(() => NotificationService))
        public readonly notificationService: NotificationService
    ) { }

    /**
     * Send a generic notification in real-time to specific users.
     */
    async sendNotification(
        userIds: string[],
        type: string,
        content: string,
        senderId: string,
        chatId?: string
    ) {
        try {
            if (!Array.isArray(userIds) || userIds.length === 0) {
                throw new Error('userIds must be a non-empty array.');
            }

            console.log('Users to notify (before filtering):', userIds);

            // ✅ Exclude sender from notifications
            const filteredUserIds = userIds.filter((id) => id !== senderId);
            console.log(`Users to notify (excluding sender ${senderId}):`, filteredUserIds);

            if (filteredUserIds.length === 0) {
                console.log('No other users to notify.');
                return { success: false, message: 'No other users to notify.' };
            }

            for (const userId of filteredUserIds) {
                const roomName = `user:${userId}`;
                const roomExists = this.server.sockets.adapter.rooms.has(roomName);

                console.log(`🔍 Checking room: ${roomName}, Exists: ${roomExists}`);

                if (!roomExists) {
                    console.warn(`⚠️ User ${userId} is not connected to room: ${roomName}`);
                    continue;
                }

                console.log(`📡 Emitting newNotification to room: ${roomName}`);

                const notification = {
                    chatId: chatId || null,
                    userId,
                    type,
                    content,
                    sender: senderId,
                    timestamp: new Date().toISOString(),
                    read: false,
                };

                this.server.to(roomName).emit('newNotification', notification);
                console.log(`✅ Notification sent successfully to user: ${userId}`);
            }

            return { success: true, message: 'Notifications sent.' };
        } catch (error) {
            console.error('❌ Error sending notifications:', error.message);
            return { success: false, message: error.message };
        }
    }

    /**
     * Send a Thread Notification
     */
    async sendThreadNotification(
        userIds: string[],
        title: string,
        senderName: string,
        senderId: string
    ) {
        try {
            // Filter out the sender's ID from the userIds array
            const recipients = userIds.filter(userId => userId !== senderId);

            // Debugging to ensure filtering works correctly
            console.log('🔔 Recipients after filtering:', recipients);
            console.log('📝 Thread Title:', title);
            console.log('👤 Sender Name:', senderName);
            console.log('🆔 Sender ID:', senderId);

            for (const userId of recipients) {
                const roomName = `user:${userId}`;
                const roomMembers = this.server.sockets.adapter.rooms.get(roomName);

                if (!roomMembers) {
                    console.warn(`⚠️ User ${userId} is not connected to room: ${roomName}`);
                    continue;
                }

                const notification = {
                    type: 'newThread',
                    content: `🧵 New Thread: ${title}`,
                    sender: senderName,
                    timestamp: new Date(),
                };

                this.server.to(roomName).emit('newNotification', notification);
                console.log(`✅ Notification sent to ${roomName}:`, notification);
            }

            console.log('✅ Thread notifications sent successfully.');
        } catch (error) {
            console.error('❌ Error sending thread notification:', error.message);
        }
    }


    async sendReplyNotification(
        userIds: string[],
        replyContent: string,
        senderName: string,
        senderId: string
    ) {
        try {

            const recipients = userIds.filter(userId => userId !== senderId);
            // ✅ Log Details Before Sending Notifications
            console.log('🔔 Sending reply notifications to users:', recipients);
            console.log('📝 Reply Content:', replyContent);
            console.log('👤 Sender Name:', senderName);
            console.log('🆔 Sender ID:', senderId);

            for (const userId of userIds) {
                const roomName = `user:${userId}`;

                // ✅ Verify Room Existence Before Emitting
                const roomMembers = this.server.sockets.adapter.rooms.get(roomName);
                if (!roomMembers || roomMembers.size === 0) {
                    console.warn(`⚠️ Room ${roomName} does not exist or has no active members.`);
                    continue;
                }

                // ✅ Send Notification
                this.server.to(roomName).emit('newReply', {
                    sender: senderName,
                    content: `A new reply was added: "${replyContent}"`,
                    timestamp: new Date(),
                });

                console.log(`📡 Notification sent to room: ${roomName}`);
            }

            console.log('✅ Reply notifications sent successfully.');
        } catch (error) {
            console.error('❌ Error sending reply notifications:', error.message);
        }
    }

    /**
     * Allow users to join their notification rooms.
     */

    @SubscribeMessage('joinNotifications')
    handleJoinNotifications(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { userId: string }
    ) {
        try {
            const userId = payload?.userId;
            if (!userId) {
                throw new Error('User ID is required to join notifications');
            }

            const roomName = `user:${userId}`;
            console.log(`🔄 User attempting to join room: ${roomName}`);

            if (client.rooms.has(roomName)) {
                console.log(`🟢 User ${userId} is already in room: ${roomName}`);
                return;
            }

            client.join(roomName);
            console.log(`✅ User ${userId} successfully joined room: ${roomName}`);

            console.log('🔍 Active Rooms After Join:', Array.from(this.server.sockets.adapter.rooms.keys()));
        } catch (error) {
            console.error('❌ Error in joinNotifications:', error.message);
            client.emit('error', { message: error.message });
        }
    }


}