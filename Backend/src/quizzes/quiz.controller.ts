import { Controller, Post, Body, Get, NotFoundException, BadRequestException} from '@nestjs/common';
import { QuizService } from './quiz.service';

@Controller('quizzes')
export class QuizController {
  constructor(private quizService: QuizService) {}

  @Post()
  async generateQuiz(
    @Body('user_id') userId: string,
    @Body('module_id') moduleId: string,
    @Body('question_count') questionCount: number,
    @Body('type') type: string,
  ) {
    if (!userId || !moduleId || !questionCount || !type) {
      throw new BadRequestException(
        'user_id, module_id, question_count, and type are required.',
      );
    }

    const result = await this.quizService.generateQuiz(userId, moduleId, questionCount, type);

    return {
      message: result.message,
      quiz: result.quiz,
    };
  }

  @Get('student')
  async getStudentQuiz(
    @Body('user_id') userId: string,
    @Body('course_id') courseId: string,
    @Body('module_id') moduleId: string,
  ) {

    if (!userId || !courseId || !moduleId) {
      throw new NotFoundException('user_id, course_id, and module_id must be provided.');
    }

    const quiz = await this.quizService.getQuizForStudent(userId, courseId, moduleId);

    if (!quiz) {
      throw new NotFoundException(`No quizzes available for module ID ${moduleId}`);
    }

    return {
      message: 'Quiz generated successfully for the student',
      quiz,
    };
  }
}
