import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { courses } from '../courses/course.schema';

export type UserDocument = HydratedDocument<users>;;

@Schema() 
export class users {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password_hash: string;

  @Prop({ required: true, enum: ['student', 'instructor', 'admin'] })
  role: string;

  @Prop({ required: false })
  profile_picture_url?: string;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ type: [String], default: [] })
  completed_courses?: string[];

  @Prop({ type: Number, default: 0 }) // Add average_score attribute
  gpa: number;
}

export const UserSchema = SchemaFactory.createForClass(users);
