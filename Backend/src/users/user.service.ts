import { Injectable, NotFoundException, BadRequestException, ForbiddenException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Error } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { ResponseDocument, ResponseSchema } from '../responses/response.schema';
import { Types } from 'mongoose';
import { courses, CourseDocument } from '../courses/course.schema';
import mongoose from 'mongoose';
import { ProgressDocument } from '../progress/models/progress.schema';


@Injectable()
export class UserService {
    constructor(
       @InjectModel('progress') private readonly progressModel: Model<ProgressDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel('responses') private responseModel: Model<ResponseDocument>, // Inject the responses model
        @InjectModel(courses.name) private courseModel: Model<CourseDocument>, // Inject the courses model
      
    ) {}
  // Fetch all users except admins
async getAllUsers(): Promise<User[]> {
  try {
    // Filter out users with the role "admin"
    const users = await this.userModel.find({ role: { $ne: 'admin' } }).exec();
    return users;
  } catch (error) {
    throw new BadRequestException('Error fetching users');
  }
}


  // Fetch user profile except for admin users
async getUserProfile(userId: string): Promise<User> {
  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new BadRequestException('Invalid user ID format');
  }

  const user = await this.userModel.findById(userId).exec();

  // Check if the user is an admin
  if (user?.role === 'admin') {
    throw new ForbiddenException('Access denied: Admin profile cannot be viewed');
  }

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user;
}

async updateUserProfile(userId: string, updateData: Partial<User>): Promise<User> {
  // Validate userId format
  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new BadRequestException('Invalid user ID format');
  }

  // Remove email and role from the updateData to prevent them from being updated
  const { email, role,gpa,completed_courses,enrolled_courses, ...filteredUpdateData } = updateData;

  try {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: filteredUpdateData }, // Update the fields provided in filteredUpdateData
      { new: true } // Return the updated document
    ).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}


  
  // Fetch enrolled courses
  async getEnrolledCourses(userId: string): Promise<string[]> {
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.userModel.findById(userId).select('enrolledCourses').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.enrolled_courses;
  }

  // Fetch completed courses
  async getCompletedCourses(userId: string): Promise<string[]> {
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.userModel.findById(userId).select('completedCourses').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.completed_courses;
  }
   


  async addCourseToEnrolled(userId: string, courseId: string): Promise<User> {
    // Validate userId and courseId
    if (!userId.match(/^[0-9a-fA-F]{24}$/) || !courseId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('Invalid user ID or course ID format');
    }
  
    // Check if the user exists
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // Check if the course exists
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException('This course is not in our system');
    }
  
    // Check if the course is already enrolled
    if (user.enrolled_courses.includes(courseId)) {
      throw new BadRequestException('This course is already enrolled');
    }
  
    // Add the course to the user's enrolled courses
    user.enrolled_courses.push(courseId);
    await user.save();
  
    // Increment the course's enrolled_students count without triggering validation
    await this.courseModel.updateOne(
      { _id: courseId },
      { $inc: { enrolled_students: 1 } } // Increment enrolled_students count
    ).exec();
  
    // Initialize quiz_grades based on nom_of_modules
    const numOfModules = course.nom_of_modules || 0;
    const quizGrades = Array(numOfModules).fill(null);
  
    // Create progress for this course
    const progress = new this.progressModel({
      user_id: userId,
      user_name: user.name,
      course_id: courseId,
      course_name: course.title,
      completed_modules: 0,
      completion_percentage: 0,
      quizzes_taken: 0,
      quiz_grades: quizGrades,
      last_quiz_score: null,
      avg_score: null,
    });
    await progress.save();
  
    return user;
  }
  
 

  // Delete from enrolled courses
async removeEnrolledCourse(userId: string, courseId: string): Promise<User> {
  // Validate userId and courseId format
  if (!userId.match(/^[0-9a-fA-F]{24}$/) || !courseId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new BadRequestException('Invalid user ID or course ID format');
  }

  // Convert courseId to ObjectId
  const courseObjectId = new mongoose.Types.ObjectId(courseId);

  // Check if the user exists
  const user = await this.userModel.findById(userId).exec();
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Check if the course exists
  const course = await this.courseModel.findById(courseId).exec();
  if (!course) {
    throw new NotFoundException('This course is not in our system');
  }

  // Check if the course is in the user's enrolled courses
  const enrolledCoursesAsObjectIds = user.enrolled_courses.map(id => new mongoose.Types.ObjectId(id));
  if (!enrolledCoursesAsObjectIds.some(id => id.equals(courseObjectId))) {
    throw new BadRequestException('The course is not in the user\'s enrolled courses');
  }

  // Remove the course from the user's enrolledCourses array
  user.enrolled_courses = user.enrolled_courses.filter(
    enrolledCourse => !new mongoose.Types.ObjectId(enrolledCourse).equals(courseObjectId)
  );
  await user.save();

  // Decrement the course's enrolled_students count
  course.enrolled_students = Math.max(0, (course.enrolled_students || 0) - 1); // Ensure it doesn't go below 0
  await course.save();

  return user;
}

  //admin
  async createUser(createUserDto: Partial<User>): Promise<User> {
    try {
      const newUser = new this.userModel(createUserDto);
      return await newUser.save(); // Save the new user
    } catch (error) {
      throw new BadRequestException('Error creating user.');
    }
  }
//admin
  async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(userId, updateData, { new: true }).exec();
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user; // Return updated user
  }
//admin
  async deleteUser(userId: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(userId).exec();
    if (!result) {
      throw new NotFoundException('User not found.');
    }
  }

  async enrollStudentInCourse(
    userId: string, // Can be instructor or admin
    studentId: string,
    courseId: string,
  ): Promise<string> {
    // Validate user (instructor or admin)
    const user = await this.userModel.findById(userId).exec();
    if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
      throw new BadRequestException(
        'Access denied. Only instructors or admins can enroll students.',
      );
    }
  
    // Validate student
    const student = await this.userModel.findById(studentId).exec();
    if (!student || student.role !== 'student') {
      throw new NotFoundException('Student not found.');
    }
  
    // Validate course
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException('Course not found.');
    }
  
    // Check if the student is already enrolled in the course
    if (student.enrolled_courses.includes(courseId)) {
      throw new BadRequestException('The student is already enrolled in this course.');
    }
  
    // Enroll the student in the course
    student.enrolled_courses.push(courseId);
    await student.save();
  
    // Increment the course's enrolled_students count
    course.enrolled_students = (course.enrolled_students || 0) + 1;
    await course.save();
  
    // Initialize quiz_grades based on nom_of_modules
    const numOfModules = course.nom_of_modules || 0;
    const quizGrades = Array(numOfModules).fill(null);
  
    // Create progress for this course
    const progress = new this.progressModel({
      user_id: studentId,
      user_name: student.name,
      course_id: courseId,
      course_name: course.title,
      completed_modules: 0,
      completion_percentage: 0,
      quizzes_taken: 0,
      quiz_grades: quizGrades,
      last_quiz_score: null,
      avg_score: null,
    });
    await progress.save();
  
    return 'Student successfully enrolled in the course.';
  }
  



  
  
}