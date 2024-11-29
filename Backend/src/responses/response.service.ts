import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResponseDocument } from './response.schema';
import { QuizDocument } from '../quizzes/quiz.schema';
import { ProgressDocument } from '../progress/progress.schema';
import { ModuleDocument } from 'src/modules/module.schema';

@Injectable()
export class ResponseService {
  constructor(
    @InjectModel('responses') private responseModel: Model<ResponseDocument>,
    @InjectModel('quizzes') private quizModel: Model<QuizDocument>,
    @InjectModel('progress') private progressModel: Model<ProgressDocument>,
    @InjectModel('modules') private moduleModel: Model<ModuleDocument>,
  ) {}

  async submitResponse(
    userId: string,
    quizId: string,
    answers: { question_id: string; selected_option: string }[],
  ): Promise<any> {
    //validation
    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found.`);
    }

    //initiallizing
    let score = 0;
    const feedback = [];

    for (const answer of answers) {
        //find the corresponding question in the quiz
        const question = quiz.questions.find(
            (q) => q.question_id.toString() === answer.question_id,
        );

        //validate question existence
        if (!question) {
            throw new BadRequestException(`Invalid question_id: ${answer.question_id}`);
        }

        //increment if correct
        const isCorrect = question.correct_answer === answer.selected_option;
        if (isCorrect) {
        score++;
        }

        //add feedback
        feedback.push({
        question_id: answer.question_id,
        selected_option: answer.selected_option,
        correct_answer: question.correct_answer,
        is_correct: isCorrect,
        });
    }

    const percentageScore = (score / quiz.questions.length) * 100;

    // Save response
    const newResponse = new this.responseModel({
      user_id: userId,
      quiz_id: quizId,
      answers,
      score: percentageScore,
      submitted_at: new Date(),
    });
    await newResponse.save();

    const module = await this.moduleModel.findById(quiz.module_id);
    if (!module) {
    throw new NotFoundException(`Module with ID ${quiz.module_id} not found.`);
    }
    // Update progress
    const progress = await this.progressModel.findOne({ user_id: userId, course_id: module.course_id});
    if (progress) {
      progress.quizzes_taken += 1;
      progress.last_quiz_score = percentageScore;
      progress.avg_score =
        (progress.avg_score * (progress.quizzes_taken - 1) + percentageScore) /
        progress.quizzes_taken;
      await progress.save();
    }

    // Generate recommendation if score is below threshold
    const threshold = 50; // Define passing threshold
    const passed = percentageScore >= threshold;
    const recommendation = passed
        ? null
        : 'We recommend revisiting the module content for improvement.';

    // Return response and feedback
    return {
        message: 'Quiz response submitted successfully',
        response: {
        score: percentageScore,
        threshold,
        passed,
        feedback,
        recommendation,
        },
    };
}
}
