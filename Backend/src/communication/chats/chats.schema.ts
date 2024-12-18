import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';


@Schema()
export class Message {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true })
    sender: mongoose.Schema.Types.ObjectId;

    @Prop({ type: String, required: true })
    content: string;

    @Prop({ type: Date, default: Date.now })
    timestamp: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

@Schema()
export class Chat {
    @Prop({ type: String, required: true })
    chatName: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true })
    courseId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'users', required: true })
    participants: mongoose.Types.ObjectId[];

    @Prop({ type: String, enum: ['student', 'mixed'], default: 'student' })
    type: string;

    @Prop({ type: [Message], default: [] })
    messages: Message[];
    // Add creatorId field to store the user who created the chat
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true })
    creatorId: mongoose.Types.ObjectId;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

// Types for documents
export type MessageDocument = Document & Message;
export type ChatDocument = Document & Chat;