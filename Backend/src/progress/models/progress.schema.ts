import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { users } from '../../users/user.schema';
import { courses } from '../../courses/course.schema';

export type ProgressDocument = HydratedDocument<progress>;

@Schema()
export class progress {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null})
  user_id: mongoose.Schema.Types.ObjectId; 

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'courses', default: null})
  course_id: mongoose.Schema.Types.ObjectId; 

  @Prop({ type: Number, default: null})
  completed_modules: number;

  @Prop({ type: Number, min: 0, max: 100, default: null})
  completion_percentage: number;

  @Prop({ type: Number, default: null})
  quizzes_taken: number;

  @Prop({ type: Number, min: 0, max: 100, default: null })
  last_quiz_score: number;

  @Prop({ type: Number, min: 0, max: 100, default: null})
  avg_score: number;

  @Prop({required: true})
  description: string;
}

export const ProgressSchema = SchemaFactory.createForClass(progress);
