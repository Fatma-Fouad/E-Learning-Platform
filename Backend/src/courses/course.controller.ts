import { Controller, Get, Post, Patch, Delete, Param, Body,Query,UploadedFile,UseInterceptors,UseGuards,BadRequestException} from '@nestjs/common';
  import { CoursesService } from './course.service';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { CreateCourseDto } from './CreateCourseDto';
  import { RateCourseDto } from './RateCourseDto';
  import { UpdateCourseDto } from './UpdateCourseDto';
  import { Express } from 'express';
//import { InstructorGuard } from './InstructorGuard'; 
import { RateInstructorDto } from './RateInstructorDto';
import { courses } from './course.schema';
import { AuthGuard } from 'src/authentication/auth.guard';
import { Roles, Role } from 'src/authentication/roles.decorator';
import { RolesGuard } from 'src/authentication/roles.guard';

  
  @Controller('courses')
  export class CoursesController {
    constructor(private coursesService: CoursesService) {}

    /**
     * Retrieve all courses for students
     */
    @Get('students')
    @UseGuards(AuthGuard) 
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
    @UseGuards(AuthGuard)
    async findAllForInstructors() {
      return this.coursesService.findAllForInstructors();
    }
  
    /**
     * Retrieve a course by its ID
     */
    @Get(':id')
    @UseGuards(AuthGuard) 
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
    @UseGuards(AuthGuard, RolesGuard) 
    @Roles('instructor' as Role, 'admin' as Role)
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
    @Patch(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin' as Role, 'instructor' as Role)
async updateWithVersionControl(
  @Param('id') id: string,
  @Body() updateCourseDto: UpdateCourseDto,
) {
  try {
    const updatedCourse = await this.coursesService.updateCourse(id, updateCourseDto);

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
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin' as Role, 'instructor' as Role)
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
    @UseGuards(AuthGuard) 
    async getEnrolledStudents(@Param('id') id: string) {
      return this.coursesService.getEnrolledStudents(id);
    }
  
    /**
     * Rate a course (students)
     */
    @Get(':id/course-rating')
    @UseGuards(AuthGuard, RolesGuard) 
    @Roles('student' as Role)
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
   * all
     */

    @Get(':id/module-count')
    @UseGuards(AuthGuard)
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
     * enroll students in course
     */

  // @Post(':id/enroll/:studentId')
//async enrollStudent(
 // @Param('id') courseId: string,
  //@Param('studentId') studentId: string,
//) {
  //try {
  //  const message = await this.coursesService.enrollStudent(courseId, studentId);
  //  return { message };
  //} catch (error) {
    //throw new BadRequestException(error.message || 'Failed to enroll the student.');
  //}
//}

  }