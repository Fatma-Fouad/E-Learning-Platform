import { Controller, Post, Body, NotFoundException } from '@nestjs/common';
import { QuizService } from './quiz.service';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  async generateQuiz(
    @Body('module_id') moduleId: string,
    @Body('question_count') questionCount: number,
    @Body('type') type: string, 
  ) {
    const quiz = await this.quizService.generateQuiz(moduleId, questionCount, type);

    if (!quiz) {
      throw new NotFoundException(`No sufficient questions available for module ID ${moduleId}`);
    }

    return {
      message: 'Quiz generated successfully',
      quiz,
    };
  }
}
