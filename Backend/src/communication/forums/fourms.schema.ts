import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
//import { users } from '../users/user.schema';
//import { courses } from '../courses/course.schema';



// Define the Reply Schema
class Reply {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true })
    userId: mongoose.Schema.Types.ObjectId; // References the User collection

    @Prop({ type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() })
    replyId: mongoose.Schema.Types.ObjectId; // Unique Reply ID

    @Prop({ type: String, required: true })
    message: string; // Message content

    @Prop({ type: Date, default: () => new Date() })
    timestamp: Date; // Time of the reply
}


// Define the Thread Schema
class Thread {
    @Prop({ type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), unique: true })
    threadId: mongoose.Schema.Types.ObjectId; // Unique Thread ID

    @Prop({ type: String, required: true })
    title: string; // Thread title

    @Prop({ type: String, required: true })
    description: string; // Thread description

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    createdBy: mongoose.Schema.Types.ObjectId; // User who created the thread

    @Prop({ type: Date, default: () => new Date() })
    createdAt: Date; // Time the thread was created

    @Prop({ type: [Reply], default: [] })
    replies: Reply[]; // Array of replies
}


export class Forum {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true })
    courseId: mongoose.Schema.Types.ObjectId; // References the Course collection

    @Prop({ type: String, required: true })
    courseName: string; // Course name

    @Prop({ type: [Thread], default: [] })
    threads: Thread[]; // Array of threads
}

// Export the Forum Schema and Document type
export type ForumDocument = HydratedDocument<Forum>;
export const ForumSchema = SchemaFactory.createForClass(Forum);