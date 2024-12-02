import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/user.schema';
import { courses } from '../../courses/course.schema';

export type ProgressDocument = HydratedDocument<progress>;

@Schema()
export class progress {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true})
  user_id: mongoose.Schema.Types.ObjectId; 

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true})
  course_id: mongoose.Schema.Types.ObjectId; 

  @Prop({ type: Number, min: 0, max: 100, required: true })
  completion_percentage: number;

  @Prop({ type: Number, default: 0, required: true})
  completed_modules: number;

  @Prop({ type: Date, default: () => new Date(), required: true })
  last_accessed: Date;

  @Prop({ type: Number, default: 0, required: true })
  quizzes_taken: number;

  @Prop({ type: Number, min: 0, max: 100, default: 0, required: true })
  avg_score: number;

  @Prop({ type: Number, min: 0, max: 100, default: null })
  last_quiz_score: number | null;
}

export const ProgressSchema = SchemaFactory.createForClass(progress);
