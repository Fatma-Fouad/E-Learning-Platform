<<<<<<< HEAD

=======
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


@Injectable()
export class CoursesService {
  constructor(
    @InjectModel('courses') private courseModel: Model<courses>,
    @InjectModel('users') private userModel: Model<users>,
    @InjectModel('modules') private moduleModel: Model<modules>,
  ) {}

  /**
   * Retrieve all courses for students
   */
  async findAllForStudents(): Promise<courses[]> {
    try {
      // Fetch all courses where isOutdated is false, excluding `previousVersions` field
      return await this.courseModel
        .find({ isOutdated: false }, { previousVersions: 0 }) // Exclude `previousVersions` field
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
      // Find the existing course by ID
      const existingCourse = await this.courseModel.findById(id).exec();
      if (!existingCourse) {
        throw new NotFoundException('Course not found.');
      }
  
      // Update the current course to mark it as outdated
      existingCourse.isOutdated = true;
      await existingCourse.save();
  
      // Prepare new course data
      const newCourseData = {
        ...existingCourse.toObject(),
        ...updateCourseDto,
        version: existingCourse.version + 1,
        previousVersion: existingCourse._id, // Reference to the previous course
        isOutdated: false, // New course is not outdated
      };
  
      // Add the current course to the previousVersions array
      newCourseData.previousVersions = [
        ...(existingCourse.previousVersions || []), // Retain existing history
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
          isOutdated: existingCourse.isOutdated,
        },
      ];
  
      delete newCourseData._id; // Ensure MongoDB generates a new ID
  
      // Create and save the new course
      const newCourse = new this.courseModel(newCourseData);
      return await newCourse.save();
    } catch (error) {
      console.error('Error:', error);
      throw new BadRequestException('Failed to update course with version control.');
    }
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
>>>>>>> 4e1c980e3723777a0cc1535231c2da1f41504e33
