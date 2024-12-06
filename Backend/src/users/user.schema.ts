import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

  @Prop({ required: true, enum: ['student', 'instructor', 'admin'] })
  role: string;

  @Prop({ default: () => new Date()})
  created_at: Date;

  @Prop({  required: true })
  password_hash: string;

  @Prop({  required: false })
  profile_picture_url: string;

  @Prop({ type: Number, default: 0 }) // Add average_score attribute
  gpa: number;

  @Prop({ type: [String], default: [] })
  recommended_courses: string[];


}

export const UserSchema = SchemaFactory.createForClass(User);
