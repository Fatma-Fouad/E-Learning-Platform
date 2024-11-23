/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
<<<<<<< Updated upstream
//import { Quiz } from '../../quizzes/models/quiz.schema';
=======
//import { quizzes } from '../quizzes/quiz.schema.ts';
//import { User } from '../users/user.schema.ts';
>>>>>>> Stashed changes

export type ResponseDocument = HydratedDocument<Response>;

@Schema()
export class Response {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, unique: true })
  response_id: mongoose.Schema.Types.ObjectId;

<<<<<<< Updated upstream
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  user_id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true })
=======
  @Prop({ type: mongoose.Schema.Types.ObjectId,ref:'User', required: true,unique: true })
  user_id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref:'quizzes', required: true,unique: true })
>>>>>>> Stashed changes
  quiz_id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: [{ question_id: String, selected_option: String }], required: true })
  answers: {
    question_id: string;
    selected_option: string;
  }[];

  @Prop({ type: Number, required: true })
  score: number;

  @Prop({ type: Date, default: () => new Date(), required: true })
  submitted_at: Date;
}

export const ResponseSchema = SchemaFactory.createForClass(Response);
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
