import { Controller, Get, Post, Patch, Delete, Param, Body, UploadedFile, UseInterceptors, UseGuards, BadRequestException } from '@nestjs/common';
import { CoursesService } from './course.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCourseDto } from './CreateCourseDto';
import { RateCourseDto } from './RateCourseDto';
import { UpdateCourseDto } from './UpdateCourseDto';
import { Express } from 'express';
//import { RateInstructorDto } from './RateCourseDto';



//import { InstructorGuard } from './InstructorGuard'; 

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) { }

  /**
   * Retrieve all courses for students
   */
  @Get('students')
  async findAllForStudents() {
    try {
      const courses = await this.coursesService.findAllForStudents();
      return {
        message: 'Courses retrieved successfully for students.',
        courses,
      };
    } catch (error) {
      console.error('Error retrieving courses for students:', error);
      throw new BadRequestException('Failed to retrieve courses for students.');
    }
  }


  /**
   * Retrieve all courses for instructors with version control
   */
  @Get('instructors')
  //@UseGuards(InstructorGuard) // Restrict access to instructors
  async findAllForInstructors() {
    return this.coursesService.findAllForInstructors();
  }

  /**
   * Retrieve a course by its ID
   */
  @Get(':id')
  async findCourseById(@Param('id') id: string) {
    try {
      return await this.coursesService.findCourseById(id);
    } catch (error) {
      throw new BadRequestException('Invalid course ID.');
    }
  }

  /**
   * Create a new course
   */
  @Post()
  //@UseGuards(InstructorGuard) // Restrict access to instructors
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    try {
      return await this.coursesService.create(createCourseDto);
    } catch (error) {
      throw new BadRequestException('Failed to create course.');
    }
  }

  /**
   * Update a course with version control (instructors only)
   */
  @Patch(':id/version-control')
  //@UseGuards(InstructorGuard) // Restrict access to instructors
  async updateWithVersionControl(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    try {
      const updatedCourse = await this.coursesService.updateWithVersionControl(id, updateCourseDto);

      return {
        message: 'Course updated with version control successfully.',
        updatedCourse,
      };
    } catch (error) {
      console.error('Error:', error);
      throw new BadRequestException(
        error.message || 'Failed to update course with version control.',
      );
    }
  }


  /**
   * Delete a course (instructors only)
   */
  @Delete(':id')
  //@UseGuards(InstructorGuard) // Restrict access to instructors
  async deleteCourse(@Param('id') id: string) {
    try {
      return await this.coursesService.deleteCourse(id);
    } catch (error) {
      throw new BadRequestException('Failed to delete course.');
    }
  }

  /**
   * Retrieve number of enrolled students in a specific course
   */
  @Get(':id/enrolled-students')
  async getEnrolledStudents(@Param('id') id: string) {
    return this.coursesService.getEnrolledStudents(id);
  }

  /**
   * Rate a course (students)
   */
  @Get(':id/course-rating')
  async getCourseRating(@Param('id') id: string) {
    try {
      const courseRating = await this.coursesService.calculateCourseRating(id);
      return {
        message: 'Course rating retrieved successfully',
        ...courseRating,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to retrieve the course rating.');
    }
  }

  /**
     * Modules per course
     */

  @Get(':id/module-count')
  async getModuleCount(@Param('id') courseId: string) {
    try {
      const moduleCount = await this.coursesService.getModuleCountForCourse(courseId);
      return {
        message: 'Module count retrieved successfully',
        courseId,
        moduleCount,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to retrieve module count.');
    }
  }

  /**
     * Rate the instructor
     */

  //@Post(':courseId/rate-instructor')
  //async postInstructorRating(
  //@Param('courseId') courseId: string,
  //@Body() body: { rate: number },
  //) {
  // try {
  // Validate input
  //const { rate } = body;
  //if (rate < 1 || rate > 5) {
  //throw new BadRequestException('Rating must be between 1 and 5.');
  //}

  // Call the service method to post the rating
  //return await this.coursesService.rateInstructor(courseId, rate);
  //} catch (error) {
  // throw new BadRequestException(error.message || 'Failed to post instructor rating.');
  // }
  //}


}