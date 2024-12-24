
import { Injectable, NotFoundException, BadRequestException, ForbiddenException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Error , ObjectId , Types} from 'mongoose';
import { User, UserDocument } from './user.schema';
import { ResponseDocument, ResponseSchema } from '../responses/response.schema';
import { courses, CourseDocument } from '../courses/course.schema';
import mongoose from 'mongoose';
import { ProgressDocument } from '../progress/models/progress.schema';
import { NotificationService } from '../communication/notifications/notification.service';
import { NotificationGateway } from 'src/communication/notifications/notificationGateway';

// hana
@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel('responses') private responseModel: Model<ResponseDocument>, // Inject the responses model
      @InjectModel(courses.name) private courseModel: Model<CourseDocument>, // Inject the courses model
      private readonly notificationService: NotificationService, // Inject NotificationService
      private readonly notificationGateway: NotificationGateway ,// Inject NotificationGateway
       @InjectModel('progress') private readonly progressModel: Model<ProgressDocument>
      
    ) {}
    //admin
  async getAllUsers(): Promise<User[]> {
    try {
      const users = await this.userModel.find().exec();
      return users;
    } catch (error) {
      throw new BadRequestException('Error fetching users');
    }
  }



  // Fetch user profile except for admin users except for admin users
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

  // Update user profile
async updateUserProfile(userId: string, updateData: Partial<User>): Promise<User> {
  // Validate userId format
  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new BadRequestException('Invalid user ID format');
  }

    // Remove email and role from the updateData to prevent them from being updated
  const { email, role, gpa, completed_courses, enrolled_courses, ...filteredUpdateData } = updateData;


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
   


  async addCourseToEnrolled(userId: string, courseId: string): Promise<{ user: User; recommendedCourses: string[] }> {
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
      // Send a notification via WebSocket
      const notification = {
        type: 'course-update',
        content: `You are already enrolled in the course: "${course.title}".`,
        timestamp: new Date(),
      };
  
      const roomName = `user:${userId}`;
      const roomMembers = this.notificationGateway.server.sockets.adapter.rooms.get(roomName);
  
      if (roomMembers) {
        this.notificationGateway.server.to(roomName).emit('newNotification', notification);
        console.log(`Notification sent to user ${userId} in room ${roomName}`);
      } else {
        console.log(`User ${userId} has not joined room: ${roomName}`);
      }
  
      // Save the notification to the database
      await this.notificationService.createNotification(
        userId,
        'course-update',
        `You are already enrolled in the course: "${course.title}".`
      );
  
      throw new BadRequestException('This course is already enrolled');
    }
  
    // Add the course to the user's enrolled courses
    user.enrolled_courses.push(courseId);
  
    // Remove the course from the user's recommended_courses if it exists
    user.recommended_courses = user.recommended_courses.filter(
      (recommendedCourse) => recommendedCourse !== courseId
    );
  
    await user.save();
  
    // Add the user to the course's enrolled_student_ids array and increment enrolled_students count
    await this.courseModel.updateOne(
      { _id: courseId },
      { 
        $inc: { enrolled_students: 1 }, // Increment enrolled_students count
        $addToSet: { enrolled_student_ids: userId } // Add userId to enrolled_student_ids without duplicates
      }
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
  
    // Send enrollment confirmation notification
    await this.notificationService.createNotification(
      userId,
      'course-update',
      `You have successfully enrolled in the course: "${course.title}".`
    );
  
    // Recommend new courses based on the user's enrolled courses
    const enrolledCourseIds = user.enrolled_courses;
    const enrolledCourses = await this.courseModel
      .find({ _id: { $in: enrolledCourseIds } })
      .exec();
    const enrolledCategories = enrolledCourses.map((c) => c.category);
  
    const recommendedCourses = await this.courseModel
      .find({
        category: { $in: enrolledCategories }, // Match enrolled categories
        _id: { $nin: [...enrolledCourseIds, ...user.recommended_courses] }, // Exclude already enrolled or recommended
      })
      .exec();
  
    // Extract IDs of recommended courses
    const recommendedCourseIds = recommendedCourses.map((c) => c._id.toString());
  
    // Update the user's recommended_courses
    user.recommended_courses.push(...recommendedCourseIds);
    await user.save();
  
    return {
      user,
      recommendedCourses: recommendedCourseIds,
    };
  }
  



  async removeEnrolledCourse(userId: string, courseId: string): Promise<User> {
    // ✅ Validate userId and courseId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/) || !courseId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('Invalid user ID or course ID format');
    }
  
    // ✅ Convert courseId to ObjectId
    const courseObjectId = new mongoose.Types.ObjectId(courseId);
  
    // ✅ Check if the user exists
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // ✅ Check if the course exists
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException('This course is not in our system');
    }
  
    // ✅ Check if the course is in the user's enrolled courses
    const enrolledCoursesAsObjectIds = user.enrolled_courses.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    if (!enrolledCoursesAsObjectIds.some((id) => id.equals(courseObjectId))) {
      throw new BadRequestException("The course is not in the user's enrolled courses");
    }
  
    // ✅ Remove the course from the user's enrolled_courses array
    user.enrolled_courses = user.enrolled_courses.filter(
      (enrolledCourse) => !new mongoose.Types.ObjectId(enrolledCourse).equals(courseObjectId)
    );
  
    // ✅ Handle recommended_courses logic
    const removedCourseCategory = course.category;
  
    // Check if the user is still enrolled in any courses of the same category
    const stillEnrolledInCategory = await this.courseModel.exists({
      _id: { $in: user.enrolled_courses },
      category: removedCourseCategory,
    });
  
    if (!stillEnrolledInCategory) {
      // Remove recommendations of this category if no other courses of the same category are enrolled
      user.recommended_courses = await this.courseModel
        .find({
          _id: { $in: user.recommended_courses.map((id) => new mongoose.Types.ObjectId(id)) },
          category: removedCourseCategory,
        })
        .then((recommendedCourses) => {
          const recommendedIdsToRemove = recommendedCourses.map((c) => c._id.toString());
          return user.recommended_courses.filter(
            (recommendedId) => !recommendedIdsToRemove.includes(recommendedId)
          );
        });
    }
  
    // ✅ Save the updated user document
    await user.save();
  
    // ✅ Remove userId from course.enrolled_student_ids
    await this.courseModel.updateOne(
      { _id: courseId },
      {
        $inc: { enrolled_students: -1 }, // Decrement enrolled_students count
        $pull: { enrolled_student_ids: { studentId: userId } }, // Remove the studentId object
      }
    ).exec();
  
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
  async deleteUser(userId: string, isSelfDeletion = false): Promise<void> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (isSelfDeletion && user.role === 'admin') {
      throw new BadRequestException('Admins cannot delete their own accounts.');
    }

    const result = await this.userModel.findByIdAndDelete(userId).exec();
    if (!result) {
      throw new NotFoundException('User not found.');
    }
  }

async deleteSelf(userId: string, authUserId: string): Promise<void> {
  // Validate that the user is deleting their own account
  if (userId !== authUserId) {
    throw new ForbiddenException('You can only delete your own account.');
  }

  // Fetch the user from the database
  const user = await this.userModel.findById(userId).exec();

  if (!user) {
    throw new NotFoundException('User not found.');
  }

  // Prevent Admins from deleting themselves (optional)
  if (user.role === 'admin') {
    throw new ForbiddenException('Admins cannot delete their own accounts.');
  }

  // Delete the user account
  const result = await this.userModel.findByIdAndDelete(userId).exec();

  if (!result) {
    throw new NotFoundException('Failed to delete user account.');
  }
}


//admin, instructor
async enrollStudentInCourse(
  userId: string, // Can be instructor or admin
  studentId: string,
  courseId: string,
): Promise<{ message: string; recommendedCourses: string[] }> {
  // ✅ Validate user (instructor or admin)
  const user = await this.userModel.findById(userId).exec();
  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
    throw new BadRequestException(
      'Access denied. Only instructors or admins can enroll students.',
    );
  }

  // ✅ Validate student
  const student = await this.userModel.findById(studentId).exec();
  if (!student || student.role !== 'student') {
    throw new NotFoundException('Student not found.');
  }

  // ✅ Validate course
  const course = await this.courseModel.findById(courseId).exec();
  if (!course) {
    throw new NotFoundException('Course not found.');
  }

  // ✅ Check if the student is already enrolled in the course
  if (student.enrolled_courses.includes(courseId)) {
    throw new BadRequestException('The student is already enrolled in this course.');
  }

  // ✅ Enroll the student in the course
  student.enrolled_courses.push(courseId);

  // ✅ Remove the course from the student's recommended_courses if it exists
  student.recommended_courses = student.recommended_courses.filter(
    (recommendedCourse) => recommendedCourse !== courseId
  );

  await student.save();

  // ✅ Update course document
  await this.courseModel.updateOne(
    { _id: courseId },
    {
      $inc: { enrolled_students: 1 }, // Increment enrolled_students count
      $addToSet: { enrolled_student_ids: { studentId} }, // Add student ID and name
    }
  ).exec();

  // ✅ Initialize quiz_grades based on nom_of_modules
  const numOfModules = course.nom_of_modules || 0;
  const quizGrades = Array(numOfModules).fill(null);

  // ✅ Create progress for this course
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

  // ✅ Recommend new courses based on the student's enrolled courses
  const enrolledCourseIds = student.enrolled_courses;
  const enrolledCourses = await this.courseModel
    .find({ _id: { $in: enrolledCourseIds } })
    .exec();
  const enrolledCategories = enrolledCourses.map((c) => c.category);

  const recommendedCourses = await this.courseModel
    .find({
      category: { $in: enrolledCategories }, // Match enrolled categories
      _id: { $nin: [...enrolledCourseIds, ...student.recommended_courses] }, // Exclude already enrolled or recommended
    })
    .exec();

  // ✅ Extract IDs of recommended courses
  const recommendedCourseIds = recommendedCourses.map((c) => c._id.toString());

  // ✅ Update the student's recommended_courses
  student.recommended_courses.push(...recommendedCourseIds);
  await student.save();

  return {
    message: 'Student successfully enrolled in the course.',
    recommendedCourses: recommendedCourseIds,
  };
}

// 
// msh ana ale 3amlaha fa 3awza 2t2ked 
  async findByEmail(email: string):Promise<UserDocument> {
    const user=await this.userModel.findOne({email}).exec();
    return user;  // Fetch a student by username
  }


// number of students that completed each course the instructor give
//hannah deleted the track complete


  // instructor search for students
  async findStudentByName(name: string): Promise<any> {
     try {
      const instructors = await this.userModel
        .find({ name: { $regex: name, $options: 'i' }, role: 'student' }) // Case-insensitive search for instructors
        .exec();

      if (!instructors || instructors.length === 0) {
        throw new NotFoundException('No instructors found with the specified name.');
      }

      return instructors;
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to search for instructors by name.'
      );
    }
  }
  
  //student search for instructor
  async findInstructorByName(name: string): Promise<User[]> {
    try {
      const instructors = await this.userModel
        .find({ name: { $regex: name, $options: 'i' }, role: 'instructor' }) // Case-insensitive search for instructors
        .exec();

      if (!instructors || instructors.length === 0) {
        throw new NotFoundException('No instructors found with the specified name.');
      }

      return instructors;
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Failed to search for instructors by name.'
      );
    }
  }

  // Fetch enrolled courses of a specific student (instruvtor)
  async getEnrolledCoursesInstructor(userId: string): Promise<string[]> {
    // Validate the user ID format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('Invalid user ID format');
    }

    // Find the user by ID and select the `enrolled_courses` field
    const user = await this.userModel.findById(userId).select('enrolled_courses').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Return the enrolled courses array
    return user.enrolled_courses;
  }
}