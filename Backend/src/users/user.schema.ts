import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema() 
export class User {
  @Prop({ required: true, unique: true })
  user_id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password_hash: string;

  @Prop({ required: true, enum: ['student', 'instructor', 'admin'] })
  role: string;

  @Prop({ required: false })
  profilePictureUrl?: string;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
