import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Notification {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true })
    userId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'chats', required: false }) // Optional
    chatId?: mongoose.Schema.Types.ObjectId;

    @Prop({ type: String, required: true, enum: ['message', 'reply', 'course-update','platform'] })
    type: string;

    @Prop({ type: String, required: true })
    content: string;

    @Prop({ type: Boolean, default: false })
    read: boolean;

    @Prop({ type: Date, default: Date.now })
    timestamp: Date;
}

@Schema()
export class PlatformNotification {
    @Prop({ required: true })
    message: string; // Announcement content

    @Prop({ type: Date, default: Date.now })
    createdAt: Date; // Timestamp

    @Prop({ default: false })
    isRead: boolean; // To mark if the notification was read

    @Prop({ type: Date, default: () => new Date(), expires: '30d' }) // Automatically delete after 30 days
    expiresAt: Date;

}




export type NotificationDocument = Notification & Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
