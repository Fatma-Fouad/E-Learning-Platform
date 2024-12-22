import { Controller, Post, Body, Get, Delete,Patch, Param ,NotFoundException, BadRequestException, UseGuards} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { RolesGuard } from '../authentication/roles.guard';
import { Role, Roles } from '../authentication/roles.decorator';
import { AuthGuard } from '../authentication/auth.guard';

@Controller('quizzes')
@UseGuards(AuthGuard, RolesGuard) 
export class QuizController {
  constructor(private quizService: QuizService) {}

  @Post(':module_id')
  @Roles('admin' as Role, 'instructor' as Role)
  async generateQuiz(
    @Body('user_id') userId: string,
    @Param('module_id') moduleId: string,
    @Body('question_count') questionCount: number,
    @Body('type') type: string,
  ) {
    if (!userId || !moduleId || !questionCount || !type) {
      throw new BadRequestException(
        'user_id, module_id, question_count, and type are required.',
      );
    }

    const existingQuiz = await this.quizService.getQuizByModule(moduleId);
    if (existingQuiz) {
      throw new BadRequestException(`A quiz already exists for this module and user.`);
    }

    const result = await this.quizService.generateQuiz(userId, moduleId, questionCount, type);

    return {
      message: result.message,
      quiz: result.quiz,       
    };
  }

  @Patch(':quiz_id')
  @Roles('admin' as Role, 'instructor' as Role)
  async updateQuiz(
    @Param('quiz_id') quizId: string,
    @Body('question_count') questionCount?: number,
    @Body('type') type?: string,
  ) {
    if (!questionCount && !type) {
      throw new BadRequestException('At least one field (question_count or type) must be provided.');
    }

    const updatedQuiz = await this.quizService.updateQuiz(quizId, questionCount, type);

    return {
      message: 'Quiz updated successfully.',
      quiz: updatedQuiz,
    };
  }


  @Delete(':id')
  @Roles('admin' as Role, 'instructor' as Role)
  async deleteQuizById(@Param('id') quizId: string) {
    const deletedQuiz = await this.quizService.deleteQuizById(quizId);
    if (!deletedQuiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found.`);
    }
    return {
      message: `Quiz with ID ${quizId} successfully deleted.`,
      deletedQuiz,
    };
  }

  @Get('module/:moduleId')
  @Roles('admin' as Role, 'instructor' as Role)
    async getQuizByModuleId(@Param('moduleId') moduleId: string) {
    const quiz = await this.quizService.getQuizByModule(moduleId);
    if (!quiz) {
      throw new NotFoundException(`Quiz for module ID ${moduleId} not found.`);
    }
    return { quiz };
  }

  @Post('student/:module_id')
  @Roles('student' as Role)
  async getStudentQuiz(
    @Body('user_id') userId: string,
    @Param('module_id') moduleId: string,
  ) {

    if (!userId || !moduleId) {
      throw new NotFoundException('user_id, and module_id must be provided.');
    }

    const quiz = await this.quizService.getQuizForStudent(userId, moduleId);

    if (!quiz) {
      throw new NotFoundException(`No quizzes available for module ID ${moduleId}`);
    }

    return {
      message: 'Quiz generated successfully for the student',
      quiz,
    };
  }
}
