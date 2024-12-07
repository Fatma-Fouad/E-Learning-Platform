import {Controller,Get,Post,Patch,Delete,Query,Param,Body,UploadedFile,UseInterceptors,UseGuards,BadRequestException, NotFoundException} from '@nestjs/common';
  import { CoursesService } from './course.service';
  import { CreateCourseDto } from './CreateCourseDto';
  import { RateCourseDto } from './RateCourseDto';
  import { UpdateCourseDto } from './UpdateCourseDto';
  import { Express } from 'express';
  import { RateInstructorDto } from './RateInstructorDto';
  import { courses } from './course.schema';
import { AuthGuard } from 'src/authentication/auth.guard';
import { Roles, Role } from 'src/authentication/roles.decorator';
import { RolesGuard } from 'src/authentication/roles.guard';

   
  
  @Controller('courses')
  export class CoursesController {
    constructor(private coursesService: CoursesService) {}

    
    /**
     * Retrieve all courses for all 
     */
    @Get('instructors')
    @UseGuards(AuthGuard) 
    async findAllForInstructors() {
      return this.coursesService.findAllForInstructors();
    }
  
    /**
     * Retrieve a course by its ID for all
     * all
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
    //@UseGuards(InstructorGuard) // Restrict access to instructors
    @UseGuards(AuthGuard, RolesGuard) 
    @Roles('instructor' as Role)
    async createCourse(@Body() createCourseDto: CreateCourseDto) {
      try {
        return await this.coursesService.create(createCourseDto);
      } catch (error) {
        throw new BadRequestException('Failed to create course.');
      }
    }

//     /**
//      * Update a course 
// instructor
//      */
@Patch(':id')
@UseGuards(AuthGuard, RolesGuard) 
    @Roles('admin' as Role, 'instructor' as Role)
  async updateCourse(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<{ message: string; updatedCourse: courses }> {
    try {
      const updatedCourse = await this.coursesService.updateCourse(id, updateCourseDto);
      return {
        message: 'Course updated successfully.',
        updatedCourse,
      };
    } catch (error) {
      console.error('Error updating course:', error);

      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException('Failed to update course.');
    }
  }


    /**
     * Delete a course (instructors only)
     */
    @Delete(':id')
    //@UseGuards(InstructorGuard) // Restrict access to instructors
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
    @UseGuards(AuthGuard, RolesGuard) 
    @Roles('admin' as Role, 'instructor' as Role)
    async getEnrolledStudents(@Param('id') id: string) {
      return this.coursesService.getEnrolledStudents(id);
    }
  
    /**
 * Rate a course (students)
 */
@Get(':id/course-rating')
@UseGuards(AuthGuard) 
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
 * add a comment on a course (students)
 */
    @Post(':courseId/comments')
    @UseGuards(AuthGuard, RolesGuard) 
    @Roles('admin' as Role, 'student' as Role)
    async addComment(
      @Param('courseId') courseId: string,
      @Body('comment') comment: string,
    ) {
      if (!comment || comment.trim() === '') {
        throw new BadRequestException('Comment cannot be empty.');
      }
      return this.coursesService.addCourseComment(courseId, comment);
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
   * Rate the instructor
   * student
   */

@Patch(':courseId/rate-instructor')
@UseGuards(AuthGuard, RolesGuard) 
@Roles('admin' as Role, 'student' as Role)
async rateInstructor(
  @Param('courseId') courseId: string,
  @Body() body: { rating: number },
) {
  try {
    // Validate the rating input
    const { rating } = body;
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5.');
    }

    // Call the service method to update the instructor rating
    return await this.coursesService.rateInstructor(courseId, rating);
  } catch (error) {
    console.error('Error:', error);
    throw new BadRequestException(error.message || 'Failed to rate the instructor.');
  }
}

/**
   * Find Course details By the module title
   */

@Get()
@UseGuards(AuthGuard) 
  async findCourseByModuleTitle(@Query('title') title: string) {
    try {
      if (!title) {
        throw new BadRequestException('Module title is required.');
      }

      const result = await this.coursesService.findCourseByModuleTitle(title);

      return {
        message: 'Course retrieved successfully by module title.',
        ...result,
      };
    } catch (error) {
      console.error('Error retrieving course by module title:', error);
      throw error;
    }
  }

  /**
   * Find Course details By the created_by//instructor
   */


  @Get('course-by-creator/:created_by')
  @UseGuards(AuthGuard) 
async findCourseByCreator(@Param('created_by') createdBy: string) {
  try {
    if (!createdBy) {
      throw new BadRequestException('The "created_by" parameter is required.');
    }

    console.log('Controller: Received created_by:', createdBy);

    const result = await this.coursesService.findCourseByCreator(createdBy);

    console.log('Controller: Retrieved result:', result);

    return {
      message: 'Course retrieved successfully by creator.',
      ...result,
    };
  } catch (error) {
    console.error('Controller: Error in findCourseByCreator:', error.message);
    throw new BadRequestException(
      error.message || 'Failed to retrieve course by creator.'
    );
  }
}


  
}