import { Controller, Get, Param, NotFoundException, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { RolesGuard } from '../../authentication/roles.guard';
import { Role, Roles } from '../../authentication/roles.decorator';
import { AuthGuard } from '../../authentication/auth.guard';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

// instructor
// Student Engagement Report
@Get('engagement/:courseId')
@UseGuards(AuthGuard, RolesGuard) 
@Roles('admin' as Role, 'instructor' as Role)
 async getStudentsEngagementReport(@Param('courseId') courseId: string) {
  try {
    const report = await this.progressService.getStudentsEngagementReport(courseId);
    return report;
  } catch (error) {
    if (error.message.includes('No student progress data found')) {
      throw new NotFoundException(`No progress data found for any students in the database.`);
    }
    if (error.message.includes('No engagement data found')) {
      throw new NotFoundException(`No engagement data available for course ID: ${courseId}. Please verify the course ID.`);
    }
    if (error.message.includes('Course not found')) {
      throw new NotFoundException(`The course with ID: ${courseId} does not exist. Please check the course ID.`);
    }
    throw new InternalServerErrorException(`An unexpected error occurred while fetching the engagement report: ${error.message}`);
  }
 }

// instructor
// Content Effectiveness Report
@Get('content-effectiveness/:courseId')
@UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
@Roles('admin' as Role, 'instructor' as Role)
 async getContentEffectivenessReport(@Param('courseId') courseId: string) {
  try {
    const report = await this.progressService.getContentEffectivenessReport(courseId);
    return report;
  } catch (error) {
    if (error.message.includes('Course not found')) {
      throw new NotFoundException(`The course with ID: ${courseId} does not exist. Please check the course ID.`);
    }
    if (error.message.includes('No modules found')) {
      throw new NotFoundException(`No modules are associated with the course ID: ${courseId}. Please ensure the course has content.`);
    }
    throw new InternalServerErrorException(`An unexpected error occurred while fetching the content effectiveness report: ${error.message}`);
  }
 }
// instructor
// Assessment Results Report
@Get('quiz-results/:courseId')
@UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
@Roles('admin' as Role, 'instructor' as Role)
 async getQuizResultsReport(@Param('courseId') courseId: string) {
  try {
    const report = await this.progressService.getQuizResultsReport(courseId);
    return report;
  } catch (error) {
    if (error.message.includes('No quiz results found')) {
      throw new NotFoundException(`No quiz results data available for course ID: ${courseId}. Please verify the course ID.`);
    }
    throw new InternalServerErrorException(`An unexpected error occurred while fetching the quiz results report: ${error.message}`);
  }
 }

// student
// Individual Student Report
@Get('student-reports/:studentId')
@UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
@Roles('admin' as Role, 'student' as Role)
  async getStudentReport(@Param('studentId') studentId: string) {
    try {
      const report = await this.progressService.getStudentReport(studentId);
      return report;
    } catch (error) {
      if (error.message.includes('No progress data found')) {
        throw new NotFoundException(`No progress data found for student with ID: ${studentId}.`);
      }
      if (error.message.includes('Course with ID')) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(`An unexpected error occurred while fetching the student report: ${error.message}`);
    }
  }
}
