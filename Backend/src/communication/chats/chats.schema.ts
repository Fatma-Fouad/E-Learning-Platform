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
@Schema()
export class Chat {
    save() {
        throw new Error('Method not implemented.');
    }
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
}


export const ChatSchema = SchemaFactory.createForClass(Chat);

// Types for documents
export type MessageDocument = Document & Message;
export type ChatDocument = Document & Chat;
