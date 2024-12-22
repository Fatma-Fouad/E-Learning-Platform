import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { courses, CourseDocument } from './course.schema';
import { User } from 'src/users/user.schema';
import { progress } from '../progress/models/progress.schema';
import { CreateCourseDto } from './CreateCourseDto';
import { RateCourseDto } from './RateCourseDto';
import { UpdateCourseDto } from './UpdateCourseDto';
import { ModulesModule } from '../modules/module.module';
import { ModuleSchema } from '../modules/module.schema';
import { modules } from '../modules/module.schema';
import { NotificationGateway } from '../communication/notifications/notificationGateway';
import { title } from 'process';



@Injectable()
export class CoursesService {
  
  constructor(
    @InjectModel('courses') private courseModel: Model<courses>,
    @InjectModel('users') private userModel: Model<User>,
    @InjectModel('modules') private moduleModel: Model<modules>,
    private readonly notificationGateway: NotificationGateway // Inject NotificationGateway
  ) { }


  /**
   * Retrieve all courses for all
   */
  async findAll(): Promise<courses[]> {
    try {
      // Only retrieve courses where isAvailable is true
      return await this.courseModel.find({ isAvailable: true }).exec();
    } catch (error) {
      console.error('Error in findAll:', error.message);
      throw new BadRequestException('Failed to retrieve available courses.');
    }
  }

     /**
   * Search for courses by keywords
   */
  async searchByKeyword(keyword: string): Promise<any> {
    try {
      const regex = new RegExp(keyword, 'i'); // Case-insensitive regex
      console.log('Service: Searching for courses with keyword:', regex);

      const courses = await this.courseModel.find({
        $or: [
          { title: { $regex: regex } },       // Search in title
          { description: { $regex: regex } } // Search in description
        ],
        isAvailable: true
      }).exec();

      if (!courses || courses.length === 0) {
        throw new NotFoundException(`No courses found for keyword: ${keyword}`);
      }

      return {
        courses: courses.map((course) => ({
          _id: course._id,
          title: course.title,
          description: course.description,
        })),
      };
    } catch (error) {
      console.error('Service: Error in searchByKeyword:', error.message);
      throw new BadRequestException(
        error.message || 'Failed to retrieve courses by keyword.'
      );
    }
  }


  /**
   * Retrieve a course by its ID  for all
   */
  async findCourseById(id: string): Promise<courses> {
    try {
      const course = await this.courseModel.findOne({ _id: id, isAvailable: true }).exec();
  
      if (!course) {
        throw new NotFoundException('Course not found or is unavailable.');
      }
      return course;
    } catch (error) {
      console.error('Error in findCourseById:', error.message);
      throw new BadRequestException('Invalid course ID.');
    }
  }


  /**
   * Create a new course instructor only not admin
   */
  async create(createCourseDto: CreateCourseDto): Promise<courses> {
    try {
      console.log('Creating course with DTO:', createCourseDto); // Log the data before saving
      const newCourse = new this.courseModel(createCourseDto);
      return await newCourse.save();
    } catch (error) {
      console.error('Error saving course:', error.message);
      throw new BadRequestException('Failed to create course.');
    }
  }

/**
   * update course 
   */
  async updateCourse(id: string, updateCourseDto: UpdateCourseDto): Promise<courses> {
    try {
      // ✅ Update the course in the database
      const updatedCourse = await this.courseModel.findByIdAndUpdate(
        id,
        updateCourseDto,
        { new: true } // Return the updated document
      ).exec();

      if (!updatedCourse) {
        throw new NotFoundException('Course not found.');
      }

      console.log(`✅ Course updated successfully: ${updatedCourse.title}`);

      // ✅ Create notification payload
      const notification = {
        type: 'course-update',
        content: `The course "${updatedCourse.title}" has been updated.`,
        courseId: updatedCourse._id,
        version: updatedCourse.version || 1, // Ensure version consistency
        read: false,
        timestamp: new Date(),
      };

      // ✅ Notify enrolled students
      for (const studentId of updatedCourse.enrolled_student_ids) {
        const roomName = `user:${studentId}`;
        const roomMembers = this.notificationGateway.server.sockets.adapter.rooms.get(roomName);

        console.log(`🔔 Room Name: ${roomName}`);
        console.log(`👥 Room Members:`, roomMembers);

        // ✅ Send Notification via WebSocket
        if (roomMembers && roomMembers.size > 0) {
          this.notificationGateway.server.to(roomName).emit('newNotification', notification);
          console.log(`📡 Notification sent to room: ${roomName}`);
        } else {
          console.warn(`⚠️ Room ${roomName} does not exist or has no members.`);
        }

        // ✅ Save Notification to Database
        await this.notificationGateway.notificationService.createNotification(
          studentId.toString(),
          'course-update',
          notification.content,
          updatedCourse._id.toString()
        );
        console.log(`💾 Notification saved to database for user: ${studentId}`);
      }

      // ✅ Return the updated course
      return updatedCourse;

    } catch (error) {
      console.error('❌ Error in updateCourse:', error.message);
      throw new BadRequestException('Failed to update course.');
    }
  }


  // /**
  //  * Delete a course
  //  */
  // async deleteCourse(id: string): Promise<void> {
  //   try {
  //     const deleted = await this.courseModel.findByIdAndDelete(id).exec();
  //     if (!deleted) {
  //       throw new NotFoundException('Course not found.');
  //     }
  //   } catch (error) {
  //     throw new BadRequestException('Failed to delete course. Ensure the ID is valid.');
  //   }
  // }   

  
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
   * Add a comment about a course during rating
   */
  async addCourseComment(courseId: string, comment: string): Promise<any> {
    // Validate the courseId format
    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('Invalid course ID format.');
    }
  
    // Check if the course exists
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID: ${courseId} not found.`);
    }
  
    // Add the comment to the comments array
    course.comments.push(comment);
    await course.save();
  
    return {
      message: 'Comment added successfully.',
      courseId: course._id,
      comments: course.comments,
    };
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
 * Find Course details by Module title
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
      course = await this.courseModel
        .findOne({ _id: module.course_id, isAvailable: true }) // Check if isAvailable is true
        .exec();
    }

    if (!course) {
      throw new NotFoundException('Course related to the module is either unavailable or not found.');
    }

    return {
      course_details: course,
      course_id: module.course_id.toString(), // Convert ObjectId to string
    };
  } catch (error) {
    console.error('Service: Error in findCourseByModuleTitle:', error.message);
    throw new BadRequestException(
      error.message || 'Failed to retrieve course by module title.',
    );
  }
}



       /**
   * Find Course details By the created_by//instructor
   */

async findCourseByCreator(createdBy: string): Promise<any> {
  try {
    console.log('Service: Searching for courses created by:', createdBy);

    // Fetch only courses where isAvailable is true
    const courses = await this.courseModel
      .find({ created_by: createdBy, isAvailable: true }) // Add isAvailable condition
      .exec();

    if (!courses || courses.length === 0) {
      console.log('Service: No available courses found for created_by:', createdBy);
      throw new NotFoundException(`No available courses found for creator: ${createdBy}`);
    }

    console.log('Service: Found courses:', courses);

    // Return all courses matching the criteria
    return {
      courses: courses.map((course) => ({
        ...course.toObject(),
        course_id: course._id.toString(), // Convert ObjectId to string
      })),
    };
  } catch (error) {
    console.error('Service: Error in findCourseByCreator:', error.message);
    throw new BadRequestException(
      error.message || 'Failed to retrieve available courses by creator.',
    );
  }
}


    /**
 * Find course details by name.
 */
async findCourseByName(Name: string): Promise<any> {
  try {
    console.log('Service: Searching for courses Name:', Name);

    // Fetch courses where the title matches and isAvailable is true
    const courses = await this.courseModel
      .find({ title: Name, isAvailable: true }) // Added isAvailable condition
      .exec();

    if (!courses || courses.length === 0) {
      console.log('Service: No available courses found for name:', Name);
      throw new NotFoundException(`No available courses found for name: ${Name}`);
    }

    console.log('Service: Found courses:', courses);

    // Return all matching courses
    return {
      courses: courses.map((course) => ({
        ...course.toObject(),
        course_id: course._id.toString(), // Convert ObjectId to string
      })),
    };
  } catch (error) {
    console.error('Service: Error in findCourseByName:', error.message);
    throw new BadRequestException(
      error.message || 'Failed to retrieve available courses by name.',
    );
  }
}


      /**
    //  * Delete a course (instructors only)
    //  */
      async softDeleteCourseById(courseId: string): Promise<any> {
        try {
          console.log('Service: Soft deleting course with ID:', courseId);
      
          // Update the `isAvailable` property to false
          const updatedCourse = await this.courseModel
            .findByIdAndUpdate(
              courseId,
              { isAvailable: false },
              { new: true } // Return the updated document
            )
            .exec();
      
          if (!updatedCourse) {
            throw new NotFoundException(`Course with ID ${courseId} not found.`);
          }
      
          console.log('Service: Updated course:', updatedCourse);
      
          return {
            message: 'Course marked as unavailable successfully.',
            course_details: updatedCourse,
          };
        } catch (error) {
          console.error('Service: Error in softDeleteCourseById:', error.message);
          throw new BadRequestException(
            error.message || 'Failed to mark course as unavailable.'
          );
        }
      }
      
      
}
    

    
