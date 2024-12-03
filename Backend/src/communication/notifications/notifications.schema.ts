import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Notification {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true })
    userId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'chats', required: true }) // Optional
    chatId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: String, required: true, enum: ['message', 'reply', 'announcement'] })
    type: string;

    @Prop({ type: String, required: true })
    content: string;

    @Prop({ type: Boolean, default: false })
    read: boolean;

    @Prop({ type: Date, default: Date.now })
    timestamp: Date;
}

export type NotificationDocument = Notification & Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
