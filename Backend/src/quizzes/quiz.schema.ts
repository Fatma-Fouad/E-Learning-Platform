import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema()
export class quizzes {
  
  @Prop({ type: String, required: true, unique: true })
  quiz_id: string; 
  
  @Prop({ type: String, required: true, unique: true })
  module_id: string; 
  
  @Prop({ type: [{ question: String, options: [String], correct_answer: String }], required: true })
  questions: { 
    question: string; 
    options: string[]; 
    correct_answer: string; 
  }[];
  
  @Prop({ type: Date, default: () => new Date() })
  created_at: Date; 
}

export const QuizSchema = SchemaFactory.createForClass(quizzes);
