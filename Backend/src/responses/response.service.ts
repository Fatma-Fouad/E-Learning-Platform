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

    //check if student took this quiz before to delete
    const existingResponse = await this.responseModel.findOne({ user_id: userId, quiz_id: quizId });
    if (existingResponse) {
      await this.responseModel.deleteOne({ user_id: userId, quiz_id: quizId });
    }

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
    const progress = await this.progressModel.findOne({ user_id: userId, course_id: module.course_id });

    if (progress) {
      //handling retakes by removing the previous score if it exists
      const previousScore = Number(existingResponse?.score); 
      const quizzesTaken = progress.quizzes_taken; 
      const avgScore = progress.avg_score;
    
      if (existingResponse) { //adjust the average score by removing the previous score
        const totalScoreBeforeRetake = avgScore * quizzesTaken;
        const adjustedTotalScore = totalScoreBeforeRetake - previousScore;
    
        progress.avg_score = quizzesTaken > 1
          ? adjustedTotalScore / (quizzesTaken - 1)
          : 0; //set avg_score to 0 if no quizzes remain
      }
    
      //update the last quiz score
      progress.last_quiz_score = percentageScore;
    
      //recalculate avg_score with the new score
      const newTotalScore = (avgScore * quizzesTaken - previousScore) + percentageScore;
      const newTotalQuizzes = existingResponse ? quizzesTaken : quizzesTaken + 1;
    
      progress.avg_score = newTotalQuizzes > 0
        ? newTotalScore / newTotalQuizzes
        : percentageScore;  //handle the case for the first quiz
    
      if (!existingResponse) {
        //increment quizzes_taken if not a retake
        progress.quizzes_taken += 1;
      }
    
      await progress.save();
    }
    
    // Generate recommendation if score is below threshold
    const threshold = 50; // Define passing threshold
    const passed = percentageScore >= threshold;
    const recommendation = passed
        ? 'Congrats,you passed!You can now check the next module.'
        : 'You did not pass.We recommend revisiting the module content for improvement.';

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
