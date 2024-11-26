import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizDocument } from './quiz.schema';
import { CreateQuizDto } from './createquiz.dto';

@Injectable()
export class QuizService {

  constructor(
    @InjectModel('quizzes') private quizModel: Model<QuizDocument>) {}

  async create(quizData: CreateQuizDto): Promise<QuizDocument> {
    const newQuiz = new this.quizModel({
      ...quizData,
      created_at: new Date(),
    });

    return await newQuiz.save();
  }
}
