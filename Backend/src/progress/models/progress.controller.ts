import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ProgressService } from './progress.service';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('engagement-report/:courseId')
  async getStudentsEngagementReport(@Param('courseId') courseId: string) {
    try {
      return await this.progressService.getStudentsEngagementReport(courseId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('content-effectiveness-report/:courseId')
  async getContentEffectivenessReport(@Param('courseId') courseId: string) {
    try {
      return await this.progressService.getContentEffectivenessReport(courseId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('quiz-results-report/:courseId')
  async getQuizResultsReport(@Param('courseId') courseId: string) {
    try {
      return await this.progressService.getQuizResultsReport(courseId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
