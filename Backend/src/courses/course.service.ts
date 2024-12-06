import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { courses } from './course.schema';
import { User } from 'src/users/user.schema';
import { progress } from '../progress/models/progress.schema';
import { CreateCourseDto } from './CreateCourseDto';
import { RateCourseDto } from './RateCourseDto';
import { UpdateCourseDto } from './UpdateCourseDto';
import { ModulesModule } from '../modules/module.module';
import { ModuleSchema } from '../modules/module.schema';
import { modules } from '../modules/module.schema';
import { NotificationGateway } from '../communication/notifications/notificationGateway';


@Injectable()
export class CoursesService {
  constructor(
    @InjectModel('courses') private courseModel: Model<courses>,
    @InjectModel('users') private userModel: Model<User>,
    @InjectModel('modules') private moduleModel: Model<modules>,
    private readonly notificationGateway: NotificationGateway // Inject NotificationGateway
  ) { }

  /**
   * Retrieve all courses for students
   */
  async findAllForStudents(): Promise<courses[]> {
    try {
      // Fetch all courses where isOutdated is false, excluding previousVersions field
      return await this.courseModel
        .find({ isOutdated: false }, { previousVersions: 0 }) // Exclude previousVersions field
        .exec();
    } catch (error) {
      throw new BadRequestException('Failed to retrieve courses.');
    }
  }


  /**
   * Retrieve all courses for instructors with version control
   */
  async findAllForInstructors(): Promise<courses[]> {
    try {
      return await this.courseModel.find().exec();
    } catch (error) {
      throw new BadRequestException('Failed to retrieve courses.');
    }
  }

  /**
   * Retrieve a course by its ID
   */
  async findCourseById(id: string): Promise<courses> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid course ID.');
      }
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
   * Create a new course
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
   * Update a course with version control
   */
  async updateWithVersionControl(
    id: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<courses> {
    try {
      console.log('--- Start Update With Version Control ---');
      console.log('Received ID:', id);
      console.log('Received Update Data:', updateCourseDto);

      // Check if ID is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid course ID.');
      }

      const existingCourse = await this.courseModel.findById(id).exec();
      console.log('Existing Course:', existingCourse);

      if (!existingCourse) {
        throw new NotFoundException('Course not found.');
      }

      // Mark the course as outdated
      existingCourse.isOutdated = true;
      await existingCourse.save();

      // Create the updated course
      const updatedCourseData = {
        ...existingCourse.toObject(),
        ...updateCourseDto,
        version: existingCourse.version + 1,
        previousVersions: [
          ...(existingCourse.previousVersions || []),
          {
            _id: existingCourse._id,
            title: existingCourse.title,
            description: existingCourse.description,
            category: existingCourse.category,
            difficulty_level: existingCourse.difficulty_level,
            created_at: existingCourse.created_at,
            created_by: existingCourse.created_by,
            multimedia: existingCourse.multimedia,
            version: existingCourse.version,
            isOutdated: true,
          },
        ],
      };

      delete updatedCourseData._id;

      const updatedCourse = new this.courseModel(updatedCourseData);
      const savedCourse = await updatedCourse.save();

      console.log('Updated Course:', savedCourse);

      // Notify enrolled students
      for (const studentId of existingCourse.enrolled_student_ids) {
        const roomName = `user:${studentId}`;
        const roomMembers = this.notificationGateway.server.sockets.adapter.rooms.get(roomName);

        console.log(`Room Name: ${roomName}`);
        console.log(`Room Members:`, roomMembers);
        const notification = {
          type: 'course-update',
          content: `The course "${savedCourse.title}" has been updated.`,
          courseId: savedCourse._id,
          version: savedCourse.version,
          read: false, // Mark notification as unread
          timestamp: new Date(), // Add a timestamp
        };

        if (roomMembers) {
          this.notificationGateway.server.to(roomName).emit('newNotification', notification);

          // Log notification details after emitting
          console.log(`Notification sent to room: ${roomName}`, notification);
        } else {
          console.log(`Room ${roomName} does not exist or has no members.`);
        }

        // Save notification in the database
        await this.notificationGateway.notificationService.createNotification(
          studentId.toString(),
          'course-update',
          notification.content,
          savedCourse._id.toString(),
        );
        console.log(`Notification saved to the database for user: ${studentId}`);
      }

      return savedCourse;
    } catch (error) {
      console.error('Error in updateWithVersionControl:', error.message);
      throw new BadRequestException('Failed to update course with version control.');
    }
  }




  /**
   * Delete a course
   */
  async deleteCourse(id: string): Promise<void> {
    console.log('Deleting course with ID:', id); // Debugging log
    const deletedCourse = await this.courseModel.findByIdAndDelete(id).exec();
    if (!deletedCourse) {
      console.error('No course found with ID:', id); // Debugging log
      throw new NotFoundException('Course not found.');
    }
    console.log('Deleted Course:', deletedCourse); // Debugging log
  }


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
      // Find all modules associated with the course
      const modules = await this.moduleModel.find({ course_id: courseId }).exec();

      if (!modules || modules.length === 0) {
        throw new NotFoundException('No modules found for this course.');
      }

      // Calculate the average rating of the modules
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
   * Modules per course
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
  //async rateInstructor(
  // courseId: string,
  //rate: number,
  //): Promise<{ instructorId: string; averageRating: number }> {
  // try {
  // Find the course by ID
  // const course = await this.courseModel.findById(courseId).exec();
  // if (!course) {
  //   throw new NotFoundException('Course not found.');
  //}

  // Ensure the course has an associated instructor
  //if (!course.instructor_id) {
  // throw new BadRequestException('No instructor associated with this course.');
  // }

  // Calculate the new average rating
  //const totalRatings = course.instructor_rating * (course.instructor_ratingCount || 0) + rate;
  //const newRatingCount = (course.instructor_ratingCount || 0) + 1;
  //const averageRating = totalRatings / newRatingCount;

  // Update the instructor's final rating and rating count
  //course.instructor_rating = parseFloat(averageRating.toFixed(2)); // Round to 2 decimal places
  //course.instructor_ratingCount = newRatingCount;
  //await course.save();

  //return {
  // instructorId: course.instructor_id.toString(),
  //averageRating: course.instructor_rating,
  //};
  // } catch (error) {
  // throw new BadRequestException(
  // error.message || 'Failed to rate the instructor. Ensure the course ID is valid.',
  // );
  //}
  //}



  /**
     *enroll student in course
     */
  //async enrollStudent(courseId: string, studentId: string): Promise<string> {
  //try {
  // Check if the course exists
  //const course = await this.courseModel.findById(courseId);
  //if (!course) {
  //throw new NotFoundException('Course not found.');
  //}
  
  // Check if the student exists
  //const student = await this.userModel.findById(studentId);
  //if (!student || student.role !== 'student') {
  // throw new NotFoundException('Student not found or not a valid student.');
  //}
  
  // Add the course to the student's enrolledCourses array
  //if (!student.enrolledCourses.includes(courseId)) {
  //student.enrolledCourses.push(courseId);
  //await student.save();
  //} else {
  //return 'Student is already enrolled in this course.';
  //}
  
  // Increment the enrolled_students count in the course
  //course.enrolled_students = (course.enrolled_students || 0) + 1;
  //await course.save();
  
  //return 'Student successfully enrolled in the course.';
  //} catch (error) {
  //console.error('Error enrolling student:', error);
  //throw new BadRequestException('Failed to enroll student. Ensure the IDs are valid.');
  // }
  //}
  
}