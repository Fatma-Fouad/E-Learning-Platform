import { Controller, Post, Body, NotFoundException, BadRequestException, UseGuards } from '@nestjs/common';
import { ResponseService } from './response.service';
import { AuthGuard } from 'src/authentication/auth.guard';
import { Roles, Role } from 'src/authentication/roles.decorator';
import { RolesGuard } from 'src/authentication/roles.guard';

@Controller('responses')
export class ResponseController {
  constructor(private responseService: ResponseService) {}

  @Post('submit')
  //@UseGuards(AuthGuard, RolesGuard) 
  //@Roles('student' as Role)
  async submitQuizResponse(
    @Body('user_id') userId: string,
    @Body('quiz_id') quizId: string,
    @Body('answers') answers: { question_id: string; selected_option: string }[],
  ) {
    if (!userId || !quizId || !answers) {
      throw new BadRequestException('user_id, quiz_id, and answers are required.');
    }

    const response = await this.responseService.submitResponse(userId, quizId, answers);

    return {
      message: 'Quiz response submitted successfully',
      response,
    };
  }
}
