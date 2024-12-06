import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { courses } from './course.schema';
import { users } from 'src/users/user.schema';
import { progress } from '../progress/progress.schema';
import { CreateCourseDto } from './CreateCourseDto';
import { RateCourseDto } from './RateCourseDto';
import { UpdateCourseDto } from './UpdateCourseDto';
import { ModulesModule } from '../modules/module.module';
import { ModuleSchema } from '../modules/module.schema'; 
import { modules } from '../modules/module.schema';
import { title } from 'process';

//import { NotificationGateway } from '../communication/notifications/notificationGateway';


@Injectable()
export class CoursesService {
  
  constructor(
    @InjectModel('courses') private courseModel: Model<courses>,
    @InjectModel('users') private userModel: Model<users>,
    @InjectModel('modules') private moduleModel: Model<modules>,
    //private readonly notificationGateway: NotificationGateway // Inject NotificationGateway
  ) { 

    
  }


  /**
   * Retrieve all courses for all
   */
  async findAllForInstructors(): Promise<courses[]> {
    try {
      return await this.courseModel.find().exec();
    } catch (error) {
      throw new BadRequestException('Failed to retrieve courses.');
    }
  }  

  /**
   * Retrieve a course by its ID  for all
   */
  async findCourseById(id: string): Promise<courses> {
    try {
      const course = await this.courseModel.findById(id).exec();
      if (!course) {
        throw new NotFoundException('Course not found.');
      }
      return course;
    } catch (error) {
      throw new BadRequestException('Invalid course ID.');
    }
  }   

  /**
   * Create a new course instructor only not admin
   */
  async create(createCourseDto: CreateCourseDto): Promise<courses> {
    try {
      const newCourse = new this.courseModel(createCourseDto);
      return await newCourse.save();
    } catch (error) {
      throw new BadRequestException('Failed to create course.');
    }
  }   

/**
   * update course 
   */

async updateCourse(id: string, updateCourseDto: UpdateCourseDto): Promise<courses> {
  const updatedCourse = await this.courseModel.findByIdAndUpdate(
    id,
    updateCourseDto,
    { new: true }, // Return the updated document
  ).exec();

  if (!updatedCourse) {
    throw new NotFoundException('Course not found.');
  }

  return updatedCourse;
}


  /**
   * Delete a course
   */
  async deleteCourse(id: string): Promise<void> {
    try {
      const deleted = await this.courseModel.findByIdAndDelete(id).exec();
      if (!deleted) {
        throw new NotFoundException('Course not found.');
      }
    } catch (error) {
      throw new BadRequestException('Failed to delete course. Ensure the ID is valid.');
    }
  }   

  
  /**
   * get number of enrolled students in a course
   */

  async getEnrolledStudents(courseId: string): Promise<number> {
    try {
      const course = await this.courseModel.findById(courseId).exec();
      if (!course) {
        throw new NotFoundException('Course not found.');
      }
      return course.enrolled_students;
    } catch (error) {
      throw new BadRequestException(
        'Failed to retrieve enrolled students. Ensure the course ID is valid.',
      );
    }
  }  
  
  /**
   * Rate a course
   */
  async calculateCourseRating(courseId: string): Promise<{ courseId: string; courseRating: number }> {
    try {
      // Find all modules associated with the course where isModuleOutdated is false
      const modules = await this.moduleModel
        .find({ course_id: courseId, isModuleOutdated: false }) 
        .exec();
  
      if (!modules || modules.length === 0) {
        throw new NotFoundException('No valid modules found for this course.');
      }
  
      // Calculate the average rating of the non-outdated modules
      const totalRatings = modules.reduce((sum, module) => sum + (module.module_rating || 0), 0);
      const averageRating = totalRatings / modules.length;
  
      return {
        courseId,
        courseRating: averageRating || 0, // Return 0 if no ratings are available
      };
    } catch (error) {
      throw new BadRequestException(
        'Failed to calculate course rating. Ensure the course ID is valid.',
      );
    }
  }
  
  /**
   * Numbers of Modules per course
   */

      async getModuleCountForCourse(courseId: string): Promise<number> {
        try {
          const moduleCount = await this.moduleModel.countDocuments({ course_id: courseId }).exec();
          if (!moduleCount) {
            throw new NotFoundException('No modules found for this course.');
          }
          return moduleCount;
        } catch (error) {
          throw new BadRequestException('Failed to retrieve module count. Ensure the course ID is valid.');
        }
      }

      /**
   * Rate an instructor
   */
      async rateInstructor(
        courseId: string,
        rating: number,
      ): Promise<{ instructorId: string; averageRating: number }> {
        try {
          // Find the course by ID
          const course = await this.courseModel.findById(courseId).exec();
          if (!course) {
            throw new NotFoundException('Course not found.');
          }
      
          // Ensure the course has an associated instructor
          if (!course.instructor_id) {
            throw new BadRequestException('No instructor associated with this course.');
          }
      
          // Calculate the new average rating
          const totalRatings =
            (course.instructor_rating || 0) * (course.instructor_ratingCount || 0) + rating;
          const newRatingCount = (course.instructor_ratingCount || 0) + 1;
          const averageRating = totalRatings / newRatingCount;
      
          // Update the instructor's final rating and rating count
          course.instructor_rating = parseFloat(averageRating.toFixed(2)); // Round to 2 decimal places
          course.instructor_ratingCount = newRatingCount;
          await course.save();
      
          // Return the instructor ID and the average rating
          return {
            instructorId: course.instructor_id.toString(),
            averageRating: course.instructor_rating,
          };
        } catch (error) {
          console.error('Error:', error);
          throw new BadRequestException(
            error.message || 'Failed to rate the instructor. Ensure the course ID is valid.',
          );
        }
      }


      /**
   * Find Course deatils by Module title
   */

      async findCourseByModuleTitle(title: string): Promise<any> {
        try {
          const module = await this.moduleModel.findOne({ title }).exec();
      
          if (!module) {
            throw new NotFoundException('Module with the specified title not found.');
          }
          let course = null;

          // Populate or fallback to a direct query
          if (module.course_id) {
            course = await this.courseModel.findById(module.course_id).exec();
          }
      
          if (!course) {
            throw new NotFoundException('Course related to the module not found.');
          }
          return {
            course_details: course,
            course_id: module.course_id.toString(),
            // Convert ObjectId to string
          };
        } catch (error) {
          throw new BadRequestException(
            error.message || 'Failed to retrieve course by module title.',
          );
        }
      }


       /**
   * Find Course details By the created_by//instructor
   */

      // async findCourseByModulecreated_by(created_by: string): Promise<any> {
      //   try {
      //     const create_by = await this.courseModel.findOne({created_by}).exec();
      
      //     if (!create_by) {
      //       throw new NotFoundException('course with the specified created_by not found.');
      //     }
      //     let course = null;
    
      //     // Populate or fallback to a direct query
      //     if (create_by.course_id) {
      //       course = await this.courseModel.findById(create_by.course_id).exec();
      //     }
      
      //     if (!course) {
      //       throw new NotFoundException('Course with this instructor not found.');
      //     }
      //     return {
      //       course_details: course,
      //       course_id: course.course_id.toString(),
      //       // Convert ObjectId to string
      //     };
      //   } catch (error) {
      //     throw new BadRequestException(
      //       error.message || 'Failed to retrieve course by created_by.',
      //     );
      //   }
      // }


      async findCourseByModuleCreatedBy(created_by: string): Promise<any> {
        try {
          // Find the course based on the `created_by` field
          const course = await this.courseModel.findOne({ created_by }).exec();
      
          if (!course) {
            throw new NotFoundException('Course with the specified created_by not found.');
          }
      
          return {
            course_details: course,
            course_id: course._id.toString(), // Convert the ObjectId to a string
          };
        } catch (error) {
          throw new BadRequestException(
            error.message || 'Failed to retrieve course by created_by.',
          );
        }
      }
      
    
  }
      

    
