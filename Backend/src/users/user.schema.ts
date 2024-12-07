import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: false}) 
  enrolled_courses: string[];

  @Prop({ required: false})
  completed_courses: string[];

  @Prop({ required: true, enum: ['student', 'instructor', 'admin'] })
  role: string;

  @Prop({ default: () => new Date()})
  created_at: Date;

  @Prop({ required: true })
  password_hash: string;

  @Prop({  required: false })
  profile_picture_url: string;

  @Prop({ type: Number, default: 0 }) // Add average_score attribute
  gpa: number;

}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
  if (this.role === 'instructor') {
    this.enrolled_courses = undefined; // Remove enrolled_courses
    this.completed_courses = undefined; // Remove completed_courses
  }
  next();
});