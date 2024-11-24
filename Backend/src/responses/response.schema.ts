import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
//import { quizzes } from '../../quizzes/quiz.schema.ts';

export type ResponseDocument = HydratedDocument<responses>;

@Schema()
export class responses {
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  user_id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'quizzes', required: true })
  quiz_id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: [{ question_id: String, selected_option: String }], required: true })
  answers: {
    question_id: String;
    selected_option: String;
  }[];

  @Prop({ type: Number, required: true })
  score: Number;

  @Prop({ type: Date, default: () => new Date(), required: true })
  submitted_at: Date;
}

export const ResponseSchema = SchemaFactory.createForClass(responses);
