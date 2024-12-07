
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Chat, ChatDocument, Message } from './chats.schema';
import { User, UserDocument } from './../../users/user.schema';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) { }

    async getAllChats(): Promise<Chat[]> {
        return this.chatModel.find().exec();
    }

    async createChat(chatName: string, participantIds: string[], courseId: string): Promise<Chat> {
        console.log('Creating chat with:', { chatName, participantIds, courseId });

        if (!chatName || !participantIds || !courseId) {
            throw new Error('Missing required fields: chatName, participantIds, or courseId.');
        }

        const participants = await this.userModel
            .find({ _id: { $in: participantIds } }, 'role')
            .exec();

        const type = participants.some(participant => participant.role === 'instructor')
            ? 'mixed'
            : 'student';

        const newChat = new this.chatModel({
            chatName,
            participants: participantIds,
            type,
            courseId: new mongoose.Types.ObjectId(courseId),
        });

        return newChat.save();
    }




    async getChatsByCourse(courseId: string): Promise<Chat[]> {
        return this.chatModel.find({ courseId: new mongoose.Types.ObjectId(courseId) }).exec();
    }


    async searchChats(searchTerm: string): Promise<any> {
        const regex = new RegExp(searchTerm, 'i'); // Case-insensitive regex
        return this.chatModel.find({
            chatName: { $regex: regex }, // Use regex without $options
        }).exec();
    }


    async addMessage(
        chatId: string,
        message: { sender: string; content: string }
    ): Promise<Chat> {
        const newMessage = {
            sender: new mongoose.Types.ObjectId(message.sender), // Convert sender to ObjectId
            content: message.content,
            timestamp: new Date(),
        };

        return this.chatModel.findByIdAndUpdate(
            chatId,
            { $push: { messages: newMessage } },
            { new: true } // Return the updated document
        ).exec();
    }




    async deleteChat(id: string): Promise<Chat | null> {
        return this.chatModel.findByIdAndDelete(id).exec();
    }


    //retrieve chat history 
    async getChatHistory(chatId: string): Promise<any> {
        console.log(`Validating chatId: ${chatId}`);
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            console.error('Invalid chatId format');
            throw new Error('Invalid chatId');
        }

        const chat = await this.chatModel.findById(chatId).populate('participants').exec();
        console.log('Chat retrieved:', chat);

        if (!chat) {
            console.error('Chat not found');
            throw new Error('Chat not found');
        }

        console.log('Returning messages:', chat.messages);
        return chat.messages;
    }


    async getChatById(chatId: string | mongoose.Types.ObjectId): Promise<Chat> {
        const chat = await this.chatModel.findById(chatId).exec();
        if (!chat) {
            throw new Error('Chat not found');
        }
        return chat;
    }


    async addParticipantToChat(chatId: string, participantId: string): Promise<void> {
        const chat = await this.chatModel.findById(chatId);
        if (!chat) {
            throw new Error(`Chat with ID ${chatId} not found`);
        }

        // Convert participantId to ObjectId
        const participantObjectId = new mongoose.Types.ObjectId(participantId);

        // Check if the participant is already in the chat
        if (!chat.participants.some((id) => id.equals(participantObjectId))) {
            chat.participants.push(participantObjectId);
            await chat.save();
            console.log(`Participant ${participantId} added to chat ${chatId}`);
        } else {
            console.log(`Participant ${participantId} is already in chat ${chatId}`);
        }
    }




}
