import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizDocument } from './quiz.schema';
import { QuestionBankDocument } from '../questionbank/questionbank.schema';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel('quizzes') private quizModel: Model<QuizDocument>,
    @InjectModel('questionbank') private questionBankModel: Model<QuestionBankDocument>,
  ) {}

  async generateQuiz(
    moduleId: string,
    questionCount: number,
    type: string, 
  ): Promise<QuizDocument> {

    const questionBank = await this.questionBankModel.findOne({ module_id: moduleId });
    if (!questionBank) {
      throw new NotFoundException(`Question bank for module ID ${moduleId} not found.`);
    }

    let filteredQuestions = questionBank.questions;
    if (type !== 'both') {
      filteredQuestions = filteredQuestions.filter((q) => q.type === type);
    }

    if (filteredQuestions.length < questionCount) {
      throw new BadRequestException('Not enough questions available to generate the quiz.');
    }

    //random select
    const selectedQuestions = filteredQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount)
      .map((question) => ({
        question_id: question.question_id, //get the og question id in the question bank
        question_text: question.question_text,
        options: question.options,
        correct_answer: question.correct_answer,
        difficulty: question.difficulty,
        type: question.type,
      }));

    const newQuiz = new this.quizModel({
      module_id: moduleId,
      questions: selectedQuestions,
      created_at: new Date(),
    });

    return await newQuiz.save();
  }
}
