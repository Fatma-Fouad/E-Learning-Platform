import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { courses } from '../courses/course.schema';
import { User } from '../users/user.schema';


export type NoteDocument = HydratedDocument<notes>;

@Schema({versionKey: false})
export class notes {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true})
  user_id: mongoose.Schema.Types.ObjectId;

  @Prop({ ref: 'courses', required: true })
  coursetitle: String;

   @Prop({required: true, unique: true})
  noteTitle: string;

  @Prop({ required: true })
  content: String;

  @Prop({type: Date, default: () => new Date()})
  created_at: Date;

  @Prop({type: Date, default: () => new Date()})
  last_updated: Date;
}

export const NoteSchema = SchemaFactory.createForClass(notes);
