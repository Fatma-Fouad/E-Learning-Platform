import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Note extends Document {
  @Prop({ required: true })
  noteId: string;

  @Prop({ required: true })
  userId: string;

  @Prop()
  courseId?: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  createdAt: Date;

  @Prop()
  lastUpdated: Date;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
