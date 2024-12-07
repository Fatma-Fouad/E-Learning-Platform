import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { courses } from '../courses/course.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ type: [String], default: [] }) // Ensure `enrolledCourses` is an array of strings
  enrolled_courses: string[];

  @Prop({ type: [String], default: [] })
  completed_courses: string[];

  @Prop({ type: [String], default: [] })
  role: string[];

  @Prop({ type: [Date], default: [] })
  created_at: Date[];

  @Prop({ type: [String], default: [] })
  password_hash: string[];

  @Prop({ type: [String], default: [] })
  profile_picture_url: string[];

  @Prop({ type: Number, default: 0 }) // Add average_score attribute
  gpa: number;

}

export const UserSchema = SchemaFactory.createForClass(User);
