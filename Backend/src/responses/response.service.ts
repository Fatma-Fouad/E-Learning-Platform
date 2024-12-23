import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResponseDocument } from './response.schema';
import { QuizDocument } from '../quizzes/quiz.schema';
import { ProgressDocument } from '../progress/models/progress.schema';
import { ModuleDocument } from 'src/modules/module.schema';
import { UserDocument } from 'src/users/user.schema';
import { CourseDocument } from 'src/courses/course.schema';

@Injectable()
export class ResponseService {
  constructor(
    @InjectModel('responses') private responseModel: Model<ResponseDocument>,
    @InjectModel('quizzes') private quizModel: Model<QuizDocument>,
    @InjectModel('progress') private progressModel: Model<ProgressDocument>,
    @InjectModel('modules') private moduleModel: Model<ModuleDocument>,
    @InjectModel('courses') private courseModel: Model<CourseDocument>,
    @InjectModel('users') private userModel: Model<UserDocument>,
  ) {}

  async submitResponse(
    userId: string,
    quizId: string,
    answers: { question_id: string; selected_option: string }[],
  ): Promise<any> {
    // Validate quiz existence
    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found.`);
    }
  
    // Initialize score and feedback
    let score = 0;
    const feedback = [];
  
    // Calculate score and feedback
    for (const answer of answers) {
      const question = quiz.questions.find((q) => q.question_id.toString() === answer.question_id);
  
      if (!question) {
        throw new BadRequestException(`Invalid question_id: ${answer.question_id}`);
      }
  
      const isCorrect = question.correct_answer === answer.selected_option;
      if (isCorrect) score++;
  
      feedback.push({
        question_id: answer.question_id,
        selected_option: answer.selected_option,
        correct_answer: question.correct_answer,
        is_correct: isCorrect,
      });
    }
  
    const percentageScore = (score / quiz.questions.length) * 100;
  
    // Fetch module and progress
    const module = await this.moduleModel.findById(quiz.module_id);
    if (!module) {
      throw new NotFoundException(`Module with ID ${quiz.module_id} not found.`);
    }
  
    const progress = await this.progressModel.findOne({ user_id: userId, course_id: module.course_id });
    if (!progress) {
      throw new NotFoundException(`Progress for user ID ${userId} not found for this course.`);
    }
  
    const course = await this.courseModel.findById(module.course_id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${module.course_id} not found.`);
    }
  
    // Ensure all variables are numbers
    const quizzesTaken = progress.quizzes_taken || 0;
    const avgScore = progress.avg_score || 0;
    const previousScore = progress.quiz_grades[module.module_order - 1] || 0;
  
    // Update quiz_grades array
    if (module.module_order > 0) {
      progress.quiz_grades[module.module_order - 1] = percentageScore;
    }
  
    // Adjust avg_score for the new score
    const totalScoreBeforeRetake = avgScore * quizzesTaken - previousScore;
    const newTotalScore = totalScoreBeforeRetake + percentageScore;
    const newTotalQuizzes = quizzesTaken + (previousScore === 0 ? 1 : 0);
  
    progress.avg_score = newTotalQuizzes > 0 ? newTotalScore / newTotalQuizzes : percentageScore;
  
    if (previousScore === 0) {
      progress.quizzes_taken += 1;
    }
  
    // Update completed modules and completion percentage
    if (percentageScore >= 50 && module.module_order > progress.completed_modules) {
      progress.completed_modules = module.module_order;
      progress.completion_percentage = (progress.completed_modules / course.nom_of_modules) * 100;
  
      // Handle course completion
      if (progress.completion_percentage === 100) {
        const user = await this.userModel.findById(userId);
        if (!user.completed_courses.includes(module.course_id.toString())) {
          user.completed_courses.push(module.course_id.toString());
          await user.save();
  
          course.completed_students = (course.completed_students || 0) + 1;
          await course.save();

          const completedCoursesProgress = await this.progressModel.find({ user_id: userId });
          const totalAvgScore = completedCoursesProgress.reduce((sum, courseProgress) => sum + courseProgress.avg_score, 0);
          const completedCoursesCount = user.completed_courses.length;

          if (completedCoursesCount > 0) {
            const avgScore = totalAvgScore / completedCoursesCount;

            // German GPA Formula
            const maxGrade = 100; // Maximum possible grade
            const minGrade = 50;  // Minimum passing grade
            user.gpa = 1 + 3 * ((maxGrade - avgScore) / (maxGrade - minGrade));
          } else {
            user.gpa = 5.0; // Default to failing GPA if no completed courses
          }

          await user.save();
        }
      }
    }

    progress.last_quiz_score = percentageScore;
  
    // Save progress
    await progress.save();
  
    // Save the new response
    const newResponse = new this.responseModel({
      user_id: userId,
      quiz_id: quizId,
      answers,
      score: percentageScore,
      submitted_at: new Date(),
    });
    await newResponse.save();
  
    // Generate feedback
    const threshold = 50;
    const passed = percentageScore >= threshold;
    const recommendation = passed
      ? 'Congrats, you passed! You can now check the next module.'
      : 'You did not pass. We recommend revisiting the module content for improvement.';
  
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