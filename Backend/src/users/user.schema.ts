import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<users>;;

@Schema()
export class users {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ type: [String], default: [] }) // Ensure `enrolledCourses` is an array of strings
  enrolledCourses: string[];

  @Prop({ type: [String], default: [] })
  completedCourses: string[];

  @Prop({ type: [String], default: [] })
  role: string[];

@Prop({ type: [Date], default: [] })
  created_at: Date[];

  @Prop({ type: [String], default: [] })
  password_hash: string[];

  @Prop({ type: [String], default: [] })
  profile_picture_url: string[];


}

export const UserSchema = SchemaFactory.createForClass(User);
