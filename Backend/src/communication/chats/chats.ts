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
        const server = this.server as any;
        server.on('connection', (socket: any) => {
            console.log(`Client connected: ${socket.id}`);

            socket.on('disconnect', () => {
                console.log(`Client disconnected: ${socket.id}`);
            });

            console.log(
                'Current active rooms:',
                Array.from(this.server.sockets.adapter.rooms.keys()),
            );
        });
    }

    @SubscribeMessage('newMessage')
    async handleNewMessage(
        @MessageBody() messageData: { chatId: string; sender: string; content: string },
        @ConnectedSocket() client: Socket
    ) {
        try {
            console.log('Raw message data received:', messageData);

            // Validate inputs
            if (!messageData.chatId || !messageData.sender || !messageData.content) {
                if (!messageData.chatId) console.error('chatId is missing');
                if (!messageData.sender) console.error('sender is missing');
                if (!messageData.content) console.error('content is missing');
                throw new Error('Missing required fields: chatId, sender, or content.');
            }

            // Save the message
            const updatedChat = await this.chatService.addMessage(messageData.chatId, {
                sender: messageData.sender,
                content: messageData.content,
            });

            console.log('Message saved:', updatedChat);

            // Broadcast the message to others in the same room
            const roomName = `chat:${messageData.chatId}`;
            this.server.to(roomName).emit('OnMessage', {
                chatId: messageData.chatId,
                sender: messageData.sender,
                content: messageData.content,
                timestamp: new Date(),
            });

            // Fetch chat details
            const chat = await this.chatService.getChatById(messageData.chatId);
            console.log(`Fetched chat details:`, chat);

            if (!chat || !chat.participants || chat.participants.length === 0) {
                console.error('No participants found in the chat. Skipping notifications.');
                return;
            }

            // Prepare notification content
            const notificationContent = `New message from ${messageData.sender}`;

            // Notify all participants except the sender
            for (const participantId of chat.participants) {
                console.log(`Processing participant: ${participantId}`);
                if (participantId.toString() !== messageData.sender) {
                    console.log(`Sending notification to participant: ${participantId}`);
                    try {
                        // Send to all other participants except the sender
                        await this.notificationGateway.sendNotification(
                            [participantId.toString()], // Wrap in an array
                            'message',
                            notificationContent,
                            messageData.sender // Pass the sender ID for exclusion
                        );
                    } catch (notificationError) {
                        console.error(`Failed to send notification to ${participantId}:`, notificationError.message);
                    }
                }
            }


            return { success: true, message: 'Message broadcasted and notifications sent successfully.' };

        } catch (error) {
            console.error('Error handling new message:', error.message);
            return { error: error.message };
        }
    }


    @SubscribeMessage('joinChat')
    async handleJoinChat(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        try {
            console.log('Raw data received:', data);

            // Parse data if it's a string
            if (typeof data === 'string') {
                data = JSON.parse(data);
                console.log('Parsed data:', data);
            }

            const chatId = data?.chatId;
            const userId = data?.userId;

            // Validate input
            if (!chatId || !userId) {
                throw new Error('chatId and userId are required to join a room');
            }

            // Convert userId to ObjectId
            const participantObjectId = new mongoose.Types.ObjectId(userId);

            // Fetch the chat
            const chat = await this.chatService.getChatById(chatId);
            if (!chat) {
                throw new Error(`Chat with ID ${chatId} not found`);
            }

            // Check and add the participant if not already in the chat
            if (!chat.participants.some((id) => id.equals(participantObjectId))) {
                chat.participants.push(participantObjectId);
                await chat.save(); // Save the updated chat document
                console.log(`Participant ${userId} added to chat ${chatId}`);
            } else {
                console.log(`Participant ${userId} is already in chat ${chatId}`);
            }

            // Add the user to the WebSocket room
            const roomName = `chat:${chatId}`;
            client.join(roomName);
            console.log(`Client ${client.id} successfully joined room: ${roomName}`);

            // Notify other participants about the new participant
            const notificationContent = `User ${userId} has joined the chat.`;
            for (const participantId of chat.participants) {
                if (participantId.toString() !== userId) {
                    await this.notificationGateway.sendNotification(
                        [participantId.toString()], // Convert ObjectId to string
                        'chat', // Notification type
                        notificationContent, // Notification content
                        userId // Exclude the joining user
                    );
                }
            }

            // Return a success message
            return { success: true, message: `Joined chat room ${chatId}` };
        } catch (error) {
            console.error('Error in handleJoinChat:', error.message);
            client.emit('error', { message: error.message });
            return { error: error.message };
        }
    }


    @SubscribeMessage('createChat')
    async handleCreateChat(
        @MessageBody() payload: any, // Accept any payload format for debugging
        @ConnectedSocket() client: Socket
    ) {
        try {
            console.log('Raw payload received:', payload);

            // Extract data from the payload, including senderId
            const { chatName, participantIds, courseId, senderId } = payload.data || {};

            console.log('Parsed chatName:', chatName);
            console.log('Parsed participantIds:', participantIds);
            console.log('Parsed courseId:', courseId);
            console.log('Parsed senderId:', senderId);

            // Validate the required fields
            if (!chatName || !participantIds || !courseId || !senderId) {
                throw new Error('Missing required fields: chatName, participantIds, courseId, or senderId.');
            }

            // Create the chat
            const newChat = await this.chatService.createChat(chatName, participantIds, courseId);
            console.log('New chat created:', newChat);

            // Emit the newly created chat ID back to the client
            client.emit('chatCreated', { chatId: newChat.courseId });

            // Add the client to the new chat room
            const roomName = `chat:${newChat.courseId}`;
            client.join(roomName);
            console.log(`Client ${client.id} joined new room: ${roomName}`);

            // Notify all participants about the new chat, excluding the sender
            const notificationContent = `New chat created: ${chatName}`;
            for (const participantId of participantIds) {
                await this.notificationGateway.sendNotification(
                    [participantId], // Wrap participantId in an array
                    'chat', // Notification type
                    notificationContent, // Notification content
                    senderId // Pass the sender's ID to exclude them
                );
            }

            return { success: true, chatId: newChat.courseId };
        } catch (error) {
            console.error('Error creating chat:', error.message);
            return { error: error.message };
        }
    }

}
