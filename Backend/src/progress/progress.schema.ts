import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
//import { users } from '../../users/user.schema.ts';
//import { courses } from '../../courses/course.schema.ts';

export type ProgressDocument = HydratedDocument<progress>;

@Schema()
export class progress {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true})
  user_id: mongoose.Schema.Types.ObjectId; 

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true})
  course_id: mongoose.Schema.Types.ObjectId; 

  @Prop({ type: Number, min: 0, max: 100, required: true })
  completion_percentage: number;

  @Prop({ type: Date, default: () => new Date(), required: true })
  last_accessed: Date;
}

export const ProgressSchema = SchemaFactory.createForClass(progress);
