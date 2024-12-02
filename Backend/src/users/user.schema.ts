import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

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
}

export const UserSchema = SchemaFactory.createForClass(users);
