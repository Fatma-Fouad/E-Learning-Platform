import { OnModuleInit } from '@nestjs/common';
import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chats.service';
import { NotificationGateway } from '../notifications/notificationGateway';
import mongoose from 'mongoose';



@WebSocketGateway({
    cors: {
        origin: '*', // Adjust for security in production
    },
})
export class ChatGateway implements OnModuleInit {
    @WebSocketServer()
    server: Server;


    constructor(
        private readonly chatService: ChatService,
        private readonly notificationGateway: NotificationGateway, // Inject here
    ) { }

    onModuleInit() {
        this.server.on('connection', (socket: Socket) => {
            console.log(`Client connected: ${socket.id}`);

            socket.on('joinUserRoom', (userId: string) => {
                if (userId) {
                    socket.join(`user:${userId}`);
                    console.log(`✅ User ${userId} joined personal room: user:${userId}`);
                } else {
                    console.warn(`⚠️ User ID not provided for socket ${socket.id}`);
                }
            });

            socket.on('disconnect', () => {
                console.log(`Client disconnected: ${socket.id}`);
            });
        });

    }
    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @MessageBody() messageData: { chatId: string; sender: string; content: string },
        @ConnectedSocket() client: Socket
    ) {
        try {
            console.log('📨 Raw message data received:', messageData);

            const { chatId, sender, content } = messageData;

            if (!chatId || !sender || !content) {
                console.error('❌ Missing required fields in sendMessage');
                throw new Error('Missing required fields: chatId, sender, or content.');
            }

            // ✅ Save message in the database
            await this.chatService.addMessage(chatId, { sender, content });
            console.log('✅ Message saved to database.');

            // ✅ Fetch chat details and participants
            const chat = await this.chatService.getChatById(chatId);

            if (!chat || !chat.participants) {
                console.warn('⚠️ No participants found in chat. Skipping notifications.');
                return;
            }

            // ✅ Fetch sender details
            const senderUser = await this.chatService.getUserFromDatabase(sender);
            const senderName = senderUser?.name || 'Unknown User';

            // ✅ Broadcast the message to the chat room
            const roomName = `chat:${chatId}`;
            console.log(`🚀 Broadcasting message to room (excluding sender): ${roomName}`);

            client.broadcast.to(roomName).emit('OnMessage', {
                chatId,
                sender,
                senderName,
                content,
                timestamp: new Date().toISOString(),
            });

            console.log('🔔 Sending notifications to participants (excluding sender)...');

            // ✅ Send Notifications to Each Participant
            // Iterate over participants and send notifications
            // ✅ Send Notifications to Each Participant
            for (const participantId of chat.participants) {
                const participantIdStr = participantId.toString(); // Ensure it's a string

                if (participantIdStr !== sender) {
                    const roomName = `user:${participantIdStr}`; // Ensure the room is properly formatted
                    console.log(`📡 Attempting to emit to room: ${roomName}`);

                    // Validate if the room exists
                    const roomExists = this.server.sockets.adapter.rooms.has(roomName);
                    console.log(`🔍 Room Exists: ${roomExists}`);

                    if (roomExists) {
                        this.server.to(roomName).emit('newNotification', {
                            chatId,
                            sender: senderName,
                            content,
                            type: 'chat',
                            timestamp: new Date().toISOString(),
                        });
                        console.log(`✅ Notification sent to room: ${roomName}`);
                    } else {
                        console.warn(`⚠️ Room ${roomName} does not exist. Skipping notification.`);
                    }
                }
            }



            console.log('✅ Notifications sent to all participants except the sender.');
            return { success: true, message: 'Message broadcasted and notifications sent successfully.' };
        } catch (error) {
            console.error('❌ Error in handleSendMessage:', error.message);
            client.emit('error', { message: error.message });
            return { success: false, message: error.message };
        }
    }


    @SubscribeMessage('validateUserRoom')
    handleValidateUserRoom(@MessageBody() payload: { userId: string }) {
        const roomName = `user:${payload.userId}`;
        const roomExists = this.server.sockets.adapter.rooms.has(roomName);
        console.log(`🔍 Room validation for ${roomName}: ${roomExists}`);
        return { roomExists };
    }


    @SubscribeMessage('sendNotification')
    async handleSendNotification(
        @MessageBody() payload: { chatId: string; sender: string; content: string }
    ) {
        try {
            console.log('🔔 Notification Payload Received:', payload);

            const { chatId, sender, content } = payload;

            // ✅ Validate Input
            if (!chatId || !sender || !content) {
                throw new Error('Missing required fields: chatId, sender, or content.');
            }

            // ✅ Fetch Sender Details
            const senderUser = await this.chatService.getUserFromDatabase(sender);
            const senderName = senderUser?.name || 'Unknown User';

            // ✅ Fetch Chat Details
            const chat = await this.chatService.getChatById(chatId);
            if (!chat || !chat.participants || chat.participants.length === 0) {
                console.warn('⚠️ No participants found in the chat. Skipping notifications.');
                return { success: false, message: 'No participants found in chat.' };
            }

            // ✅ Send Notification to Participants Except Sender
            for (const participantId of chat.participants) {
                if (participantId.toString() !== sender) {
                    const roomName = `user:${participantId}`;
                    console.log(`📡 Emitting newNotification to room: ${roomName}`);
                    console.log(`🔍 Room Exists:`, this.server.sockets.adapter.rooms.has(roomName));

                    this.server.to(roomName).emit('newNotification', {
                        chatId,
                        sender: senderName,
                        content,
                        type: 'chat',
                        timestamp: new Date().toISOString(),
                    });
                }
            }


            console.log('✅ Notifications sent to all participants except the sender.');

            return { success: true, message: 'Notifications sent successfully.' };
        } catch (error) {
            console.error('❌ Error sending notifications:', error.message);
            return { success: false, message: error.message };
        }
    }


    @SubscribeMessage('joinChat')
    handleJoinChat(@MessageBody() data: { chatId: string; userId: string }, @ConnectedSocket() client: Socket) {
        try {
            console.log('🔄 User attempting to join chat:', data);

            if (!data.chatId || !data.userId) {
                throw new Error('chatId and userId are required to join a chat.');
            }

            const roomName = `chat:${data.chatId}`;
            client.join(roomName);
            console.log(`✅ User ${data.userId} successfully joined room: ${roomName}`);

            client.emit('joinedChat', { success: true, room: roomName });
        } catch (error) {
            console.error('❌ Error in joinChat:', error.message);
            client.emit('error', { message: error.message });
        }
    }


    @SubscribeMessage('createChat')
    async handleCreateChat(
        @MessageBody() payload: any,
        @ConnectedSocket() client: Socket
    ) {
        try {
            console.log('Raw payload received:', payload);

            const chatName = payload.data?.chatName;
            const courseId = Array.isArray(payload.data?.courseId)
                ? payload.data.courseId[0]
                : payload.data?.courseId;
            const participantIds = Array.isArray(payload.data?.participantIds)
                ? payload.data.participantIds
                : [payload.data?.participantIds];
            const senderId = payload.data?.senderId;
            const type = payload.data?.type; // 'student', 'group', 'mixed'

            console.log('Parsed chatName:', chatName);
            console.log('Parsed participantIds:', participantIds);
            console.log('Parsed courseId:', courseId);
            console.log('Parsed senderId:', senderId);
            console.log('Parsed type:', type);

            // Validate required fields
            if (!chatName || !participantIds || !courseId || !senderId || !type) {
                throw new Error('Missing required fields: chatName, participantIds, courseId, senderId, or type.');
            }

            // Type-specific validation
            if (type === 'student') {
                if (participantIds.length !== 2) {
                    throw new Error('One-to-One chat must have exactly two participants.');
                }
                const [creatorId, participantId] = participantIds;

                const creator = await this.chatService.getUserFromDatabase(creatorId);
                const participant = await this.chatService.getUserFromDatabase(participantId);

                if (!creator || creator.role !== 'student') {
                    throw new Error('Creator must be a student for One-to-One chats.');
                }
                if (!participant || participant.role !== 'student') {
                    throw new Error('Participant must be a student for One-to-One chats.');
                }
            }

            if (type === 'group') {
                if (participantIds.length < 2) {
                    throw new Error('Group chats must have at least two participants.');
                }
                for (const participantId of participantIds) {
                    const participant = await this.chatService.getUserFromDatabase(participantId);
                    if (!participant || participant.role !== 'student') {
                        throw new Error(`Participant with ID ${participantId} must be a student.`);
                    }
                }
            }

            if (type === 'mixed') {
                const creator = await this.chatService.getUserFromDatabase(senderId);
                if (!creator || creator.role !== 'instructor') {
                    throw new Error('Only instructors can create mixed chats.');
                }
            }

            // Create the chat
            const newChat = await this.chatService.createChat(
                chatName,
                participantIds,
                courseId,
                senderId,
                type
            );
            console.log('New chat created:', newChat);

            // Emit chat creation event to the client
            client.emit('chatCreated', { chatId: newChat.courseId });

            // Add client to the chat room
            const roomName = `chat:${newChat.courseId}`;
            client.join(roomName);
            console.log(`Client ${client.id} joined new room: ${roomName}`);

            // Send notifications to participants
            const notificationContent = `New ${type} chat created: ${chatName}`;
            for (const participantId of participantIds) {
                await this.notificationGateway.sendNotification(
                    [participantId],
                    'chat',
                    notificationContent,
                    senderId
                );
            }

            return { success: true, chatId: newChat.courseId };
        } catch (error) {
            console.error('Error creating chat:', error.message);
            return { error: error.message };
        }
    }
}