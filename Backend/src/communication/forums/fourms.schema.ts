
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../users/user.schema';
import { courses } from '../../courses/course.schema';

@Schema()
export class Reply {
    @Prop({ type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() })
    replyId: mongoose.Schema.Types.ObjectId; // Use replyId instead of _id

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    userId: mongoose.Schema.Types.ObjectId; // Reference to the user who replied

    @Prop({ type: String, required: true })
    message: string; // Reply content

    @Prop({ type: Date, default: Date.now })
    timestamp: Date; // Time of the reply
}

export type ReplyDocument = Document & Reply;
export const ReplySchema = SchemaFactory.createForClass(Reply);



@Schema()
export class Thread {
    @Prop({ type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() })
    threadId: mongoose.Schema.Types.ObjectId; // Unique thread ID

    @Prop({ type: String, required: true })
    title: string; // Thread title

    @Prop({ type: String, required: true })
    description: string; // Thread description

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    createdBy: mongoose.Schema.Types.ObjectId; // User who created the thread

    @Prop({ type: Date, default: Date.now })
    createdAt: Date; // Time of thread creation

    @Prop({ type: [ReplySchema], _id: false, default: [] }) // Disable _id generation for replies
    replies: Reply[]; // Array of replies
}


export type ThreadDocument = Document & Thread;
export const ThreadSchema = SchemaFactory.createForClass(Thread);

@Schema()
export class Forum {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true })
    courseId: mongoose.Schema.Types.ObjectId; // Reference to Course

    @Prop({ type: String, required: true })
    courseName: string; // Course name

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    createdBy: mongoose.Schema.Types.ObjectId; // User who created the thread

    @Prop({ type: [ThreadSchema], _id: false, default: [] }) // Disable _id for threads
    threads: Thread[];


}

export type ForumDocument = Document & Forum;
export const ForumSchema = SchemaFactory.createForClass(Forum);
