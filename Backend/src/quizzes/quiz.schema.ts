import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
//import { modules } from '../../modules/module.schema.ts';

@Schema()
export class quizzes {
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, unique: true })
  quiz_id: mongoose.Schema.Types.ObjectId; 
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'modules', required: true , unique: true})
  module_id: mongoose.Schema.Types.ObjectId; 
  
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
