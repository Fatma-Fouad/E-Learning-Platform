import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
//import { courses } from '../../courses/course.schema.ts';
//import { users } from '../users/user.schema.ts';

@Schema({ timestamps: true })
export class Note {

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, unique: true })
  noteId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, unique: true })
  user_id: mongoose.Schema.Types.ObjectId;


  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true , unique: true})
  courseId: mongoose.Schema.Types.ObjectId;;

  @Prop({ required: true })
  content: string;

  @Prop({type: Date, default: () => new Date()})
  createdAt: Date;

  @Prop({type: Date, default: () => new Date()})
  lastUpdated: Date;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
