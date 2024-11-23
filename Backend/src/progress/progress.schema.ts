import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
//import { users } from '../../modules/users.schema.ts';
//import { courses } from '../../modules/course.schema.ts';

@Schema()
export class progress {

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, unique: true })
  progress_id: mongoose.Schema.Types.ObjectId; 

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, unique: true })
  user_id: mongoose.Schema.Types.ObjectId; 

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true, unique: true })
  course_id: mongoose.Schema.Types.ObjectId; 

  @Prop({ type: Number, min: 0, max: 100, required: true })
  completion_percentage: number;

  @Prop({ type: Date, default: () => new Date(), required: true })
  last_accessed: Date;
}

export const ProgressSchema = SchemaFactory.createForClass(progress);
