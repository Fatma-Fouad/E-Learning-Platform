
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Chat, ChatDocument } from './chats.schema';
import { User, UserDocument } from './../../users/user.schema';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) { }

    async getUserFromDatabase(userId: string): Promise<UserDocument> {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new BadRequestException('Invalid user ID');
        }

        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        return user;
    }


    async getAllChats(): Promise<Chat[]> {
        return this.chatModel.find().exec();
    }

    async createChat(
        chatName: string,
        participantIds: string[],
        courseId: string,
        userId: string,
        type: 'student' | 'group' | 'mixed'
    ): Promise<Chat> {
        console.log('Creating chat with:', { chatName, participantIds, courseId, userId, type });

        if (!chatName || !participantIds || !courseId || !userId || !type) {
            throw new BadRequestException('Missing required fields: chatName, participantIds, courseId, userId, or type.');
        }

        // Validate creator's existence
        const creator = await this.userModel.findById(userId);
        if (!creator) {
            throw new NotFoundException(`User with ID ${userId} not found.`);
        }

        // Validate participant IDs
        const participants = await this.userModel
            .find({ _id: { $in: participantIds } }, 'role')
            .exec();

        if (!participants || participants.length !== participantIds.length) {
            throw new BadRequestException('One or more participant IDs are invalid.');
        }

        // Explicitly use the passed type
        const chatType = type;

        // Create the chat
        const newChat = new this.chatModel({
            chatName,
            participants: participantIds.map(id => new mongoose.Types.ObjectId(id)),
            courseId: new mongoose.Types.ObjectId(courseId),
            type: chatType,
            creatorId: new mongoose.Types.ObjectId(userId),
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

    async getChatById(chatId: string | mongoose.Types.ObjectId): Promise<ChatDocument> {
        const chat = await this.chatModel
            .findById(chatId)
            .populate({
                path: 'messages.sender',  // Populate sender details
                select: 'name'            // Only fetch the name field
            })
            .populate({
                path: 'participants',     // Populate participant details
                select: '_id'             // Only fetch the _id field
            })
            .exec();

        if (!chat) {
            throw new Error('Chat not found');
        }

        // Map participants to their string IDs
        chat.participants = chat.participants.map((participant: any) => participant._id.toString());

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
