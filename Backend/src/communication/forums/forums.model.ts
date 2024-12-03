/* eslint-disable prettier/prettier */
import mongoose from 'mongoose';

export interface Reply {
    replyId: mongoose.Schema.Types.ObjectId; // Add replyId to match the schema
    userId: mongoose.Schema.Types.ObjectId;
    message: string;
    timestamp: Date;
}

export interface Thread {
    threadId: mongoose.Schema.Types.ObjectId;
    title: string;
    description: string;
    createdBy: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    replies: Reply[];
}

export interface Forum extends mongoose.Document {
    courseId: mongoose.Schema.Types.ObjectId;
    courseName: string;
    threads: Thread[];
}
