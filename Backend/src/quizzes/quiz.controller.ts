import { Controller, Post, Body, NotFoundException, UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { RolesGuard } from '../authentication/roles.guard';
import { Role, Roles } from '../authentication/roles.decorator';
import { AuthGuard } from '../authentication/auth.guard';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
  @Roles('admin' as Role, 'instructor' as Role)
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
