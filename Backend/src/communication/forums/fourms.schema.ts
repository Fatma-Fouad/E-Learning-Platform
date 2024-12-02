import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
//import { users } from '../users/user.schema';
//import { courses } from '../courses/course.schema';
// Define the Reply Schema
class Reply {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true })
    userId: mongoose.Schema.Types.ObjectId; // References the User collection

    @Prop({ type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), unique: true })
    replyId: mongoose.Schema.Types.ObjectId; // Unique Reply ID

    @Prop({ type: String, required: true })
    message: string; // Message content

    @Prop({ type: Date, default: () => new Date() })
    timestamp: Date; // Time of the reply
}