import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { modules } from '../modules/module.schema';

export type QuestionBankDocument = QuestionBank & Document;

@Schema()
export class QuestionBank {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'modules', required: true })
  module_id: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: [
      {
        question_id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
        question_text: { type: String, required: true },
        options: { type: [String], required: true },
        correct_answer: { type: String, required: true },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
        type: { type: String, enum: ['mcq', 'tf'], required: true },
      },
    ],
    required: true,
    _id: false,
  })
  questions: {
    question_id: mongoose.Schema.Types.ObjectId; 
    question_text: string;
    options: string[];
    correct_answer: string;
    difficulty: string;
    type: string;
  }[];
}

export const QuestionBankSchema = SchemaFactory.createForClass(QuestionBank);
