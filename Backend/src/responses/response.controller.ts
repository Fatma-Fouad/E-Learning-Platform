import { Controller, Post, Body, NotFoundException, BadRequestException } from '@nestjs/common';
import { ResponseService } from './response.service';

@Controller('responses')
export class ResponseController {
  constructor(private responseService: ResponseService) {}

  @Post()
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
