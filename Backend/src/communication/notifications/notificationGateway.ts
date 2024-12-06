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
        
    ) { } // Change to public

    /**
     * Send a notification in real-time to specific users.
     * @param userIds Array of user IDs to notify
     * @param type Type of the notification
     * @param content Content of the notification
     * @param senderId ID of the sender (to exclude from notifications)
     * @param chatId Optional chat ID for the notification
     */
    async sendNotification(
        userIds: string[],
        type: string,
        content: string,
        senderId: string,
        chatId?: string,
    ) {
        try {
            if (!Array.isArray(userIds) || userIds.length === 0) {
                throw new Error('userIds must be a non-empty array.');
            }

            console.log('Users to notify (before filtering):', userIds);

            // Exclude sender
            const filteredUserIds = userIds.filter((id) => id !== senderId);
            console.log(`Users to notify (excluding sender ${senderId}):`, filteredUserIds);

            if (filteredUserIds.length === 0) {
                console.log('No other users to notify.');
                return { success: false, message: 'No other users to notify.' };
            }

            console.log('Active rooms:', Array.from(this.server.sockets.adapter.rooms.keys()));

            for (const userId of filteredUserIds) {
                const roomName = `user:${userId}`;
                const roomMembers = this.server.sockets.adapter.rooms.get(roomName);

                if (!roomMembers) {
                    console.log(`User ${userId} has not joined room: ${roomName}`);
                    continue; // Skip if user hasn’t joined
                }

                console.log(`Sending notification to room: ${roomName}`);

                // Prepare the notification payload
                const notification = {
                    chatId: chatId || null,
                    userId: userId,
                    type,
                    content,
                    timestamp: new Date(),
                    read: false,
                };

                // Emit the notification
                this.server.to(roomName).emit('newNotification', notification);

                console.log(`Notification sent successfully to user: ${userId}`);
            }

            return { success: true, message: 'Notifications sent.' };
        } catch (error) {
            console.error('Error sending notifications:', error.message);
            return { success: false, message: error.message };
        }
    }

    /**
     * Allow users to join their notification rooms.
     * Clients must emit 'joinNotifications' with their userId to receive notifications.
     */
    @SubscribeMessage('joinNotifications')
    handleJoinNotifications(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { userId: string },
    ) {
        try {
            console.log('joinNotifications event received with payload:', payload);

            // Validate payload
            const userId = payload?.userId;
            if (!userId) {
                throw new Error('User ID is required to join notifications');
            }

            // Assign the user to their notification room
            const roomName = `user:${userId}`;
            client.join(roomName);

            console.log(`User ${userId} successfully joined room: ${roomName}`);

            // Debug Step: Check room membership
            console.log(`Room ${roomName} members:`, this.server.sockets.adapter.rooms.get(roomName));
        } catch (error) {
            console.error('Error handling joinNotifications:', error.message);
            client.emit('error', { message: error.message });
        }
    }
}
