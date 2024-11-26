import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { modules } from '../modules/module.schema';

export type QuizDocument = HydratedDocument<quizzes>;

@Schema()
export class quizzes {
     
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'modules', required: true})
  module_id: mongoose.Schema.Types.ObjectId; 
  
  @Prop({
    type: [
      {
        question_id: { type: String, required: true },
        question_text: { type: String, required: true },
        options: { type: [String], required: true },
        correct_answer: { type: String, required: true },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
        type: { type: String, enum: ['mcq', 'tf'], required: true }
      }
    ],
    required: true
  })
  questions: {
    question_id: string;
    question_text: string;
    options: string[];
    correct_answer: string;
    difficulty: string;
    type: string;
  }[];
  
  @Prop({ type: Date, default: () => new Date() })
  created_at: Date; 
}

export const QuizSchema = SchemaFactory.createForClass(quizzes);
