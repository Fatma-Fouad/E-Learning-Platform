import {Controller,Get,Post,Patch,Delete,Query,Param,Body,UploadedFile,UseInterceptors,UseGuards,BadRequestException, NotFoundException} from '@nestjs/common';
  import { CoursesService } from './course.service';
  import { CreateCourseDto } from './CreateCourseDto';
  import { RateCourseDto } from './RateCourseDto';
  import { UpdateCourseDto } from './UpdateCourseDto';
  import { Express } from 'express';
  import { RateInstructorDto } from './RateInstructorDto';
  import { courses } from './course.schema';

   
  
  @Controller('courses')
  export class CoursesController {
    constructor(private coursesService: CoursesService) {}

    
    /**
     * Retrieve all courses for all 
     */
    @Get('instructors')
    async findAllForInstructors() {
      return this.coursesService.findAllForInstructors();
    }
  
    /**
     * Retrieve a course by its ID for all
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

//     /**
//      * Update a course 
//      */
@Patch(':id')
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
 * add a comment on a course (students)
 */
    @Post(':courseId/comments')
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

@Patch(':courseId/rate-instructor')
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


//   @Get('created-by')
// async findCoursesByCreator(@Query('created_by') createdBy: string) {
//   try {
//     if (!createdBy) {
//       throw new BadRequestException('Creator is required.');
//     }

//     const result = await this.coursesService.findCoursesByCreator(createdBy);

//     return {
//       message: 'Courses retrieved successfully by creator.',
//       ...result,
//     };
//   } catch (error) {
//     console.error('Error retrieving courses by creator:', error);
//     throw error;
//   }
// }


// @Get()
//   async findCourseByModulecreated_by(@Query('created_by') created_by: string) {
//     try {
//       if (!created_by) {
//         throw new BadRequestException('Module title is required.');
//       }

//       const result = await this.coursesService.findCourseByModulecreated_by(created_by);

//       return {
//         message: 'Course retrieved successfully by module title.',
//         ...result,
//       };
//     } catch (error) {
//       console.error('Error retrieving course by module title:', error);
//       throw error;
//     }
//   }


// @Get('created-byextra')
// async findCoursesByCreator(@Query('created_by') createdBy: string) {
//   try {
//     if (!createdBy) {
//       throw new BadRequestException('Creator is required.');
//     }

//     const result = await this.coursesService.findCourseByModuleCreatedBy(createdBy);

//     return {
//       message: 'Course retrieved successfully by creator.',
//       ...result,
//     };
//   } catch (error) {
//     throw new BadRequestException(error.message || 'Failed to retrieve course by creator.');
//   }
// }
}
