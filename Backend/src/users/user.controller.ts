import { Controller, Get,Req, Put,Query, Post, Delete, Param, BadRequestException, Body , UseGuards} from '@nestjs/common';
import { AuthGuard } from '../authentication/auth.guard';
import { UserService } from './user.service';
import { RolesGuard } from '../authentication/roles.guard';
import { Role, Roles } from '../authentication/roles.decorator';
import { LoginAttempt } from '../authentication/login.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
<<<<<<< Updated upstream

=======
import { Types , ObjectId } from 'mongoose'; 
>>>>>>> Stashed changes


@Controller('user')

export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectModel('LoginAttempt') private readonly LoginAttempt: Model<LoginAttempt>, // Correct injection
    ) {}
// fatma
  @Get('users')
  //@UseGuards(AuthGuard) // Require authentication
  getProfile() {
    return { message: 'This is a protected route' };
  }

  @Get('admin')
  //@UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
  //@Roles('admin' as Role)  // Only admins can access this route
  getAdminData() {
    return { message: 'This is an admin-only route' };
  }
  
// hana
@Post(':id/enroll-course/:courseId')
//@UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
//@Roles('admin' as Role, 'student' as Role)
  async enrollCourse(
  @Param('id') userId: string,
  @Param('courseId') courseId: string 
) {
   
  console.log(`Enroll Request: UserID - ${userId}, CourseID - ${courseId}`);
  try {
    return await this.userService.addCourseToEnrolled(userId, courseId);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw new BadRequestException(error.message);
    
  }
  
}
 

//admin 
@Get(':id/profile')
//@UseGuards(AuthGuard)
//@UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
<<<<<<< Updated upstream
@Roles('admin' as Role)
=======
//@Roles('admin' as Role)
>>>>>>> Stashed changes
 // Require authentication and specific roles
async getUserProfile(@Param('id') userId: string) {
  try {
    return await this.userService.getUserProfile(userId);
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}
//admin 
@Get()
//@UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
//@Roles('admin' as Role)
async getAllUser() {
  try {
    return await this.userService.getAllUsers();
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}

//student, instrctor not admin
  // Update user profile with error handling
  @Put(':id/profile')
  // @UseGuards(AuthGuard, RolesGuard)
  async updateUserProfile(@Param('id') userId: string, @Body() updateData: any) {
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Update data cannot be empty');
    }

    const { email, role, created_at, completed_courses, enrolled_courses, gpa, ...filteredUpdateData } = updateData;
    if (email || role || created_at || completed_courses || enrolled_courses || gpa) {
      throw new BadRequestException('Some fields cannot be updated');
    }

    try {
      const updatedUser = await this.userService.updateUserProfile(userId, filteredUpdateData);
      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }
      return updatedUser;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

//admin , student 
  // Get enrolled courses for a user
  @Get(':id/enrolled-courses')
<<<<<<< Updated upstream
 // @UseGuards(AuthGuard, RolesGuard)
 // @Roles('admin' as Role, 'student' as Role)
=======
  //@UseGuards(AuthGuard, RolesGuard)
  //@Roles('admin' as Role, 'student' as Role)
>>>>>>> Stashed changes
  async getEnrolledCourses(@Param('id') userId: string) {
    try {
      return await this.userService.getEnrolledCourses(userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

//admin , student
  // Get completed courses for a user
  @Get(':id/completed-courses')
//  @UseGuards(AuthGuard, RolesGuard)
//  @Roles('admin' as Role, 'student' as Role)
  async getCompletedCourses(@Param('id') userId: string) {
    try {
      return await this.userService.getCompletedCourses(userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }


// Create a new account (student/instructor) - admin
<<<<<<< Updated upstream
@UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
//@Roles('admin' as Role)  // Only admins can access this route
//@Post('/accounts/:role')
=======
//@UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
//@Roles('admin' as Role)  // Only admins can access this route
@Post('/accounts/:role')
>>>>>>> Stashed changes
async createAccount(@Param('role') role: string, @Body() createUserDto: any) {
  try {
    return await this.userService.createUser(createUserDto);
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}

// Update an existing account -admin
@Put('/accounts/:role/:id')
//@UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
//@Roles('admin' as Role)  // Only admins can access this route
async updateAccount(
  @Param('role') role: string,
  @Param('id') userId: string,
  @Body() updateData: any,
) {
  try {
    return await this.userService.updateUser(userId, updateData);
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}

// Delete an account - admin
@Delete('/accounts/:role/:id')
//@UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
//@Roles('admin' as Role)  // Only admins can access this route
async deleteAccount(@Param('role') role: string, @Param('id') userId: string) {
  try {
    return await this.userService.deleteUser(userId);
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}
//
@Delete('/delete-account')
//@UseGuards(AuthGuard)
//@Roles('student' as Role, 'instrctor' as Role)
async deleteSelf(@Req() request: any) {
  const authUserId = request.user._id; // Authenticated user ID from JWT/session
  try {
    await this.userService.deleteSelf(authUserId, authUserId);
    return { message: 'Account deleted successfully.' };
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}

 

//admin , instrctor
@Post(':instructorId/enroll-student/:studentId/:courseId')
//@UseGuards(AuthGuard, RolesGuard)
//@Roles('instructor' as Role, 'admin' as Role)
  async enrollStudentInCourse(
    @Param('instructorId') instructorId: string,
    @Param('studentId') studentId: string,
    @Param('courseId') courseId: string,
  ) {
    try {
      return await this.userService.enrollStudentInCourse(
        instructorId,
        studentId,
        courseId,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  //all-
  @Delete(':id/remove-course/:courseId')
  //@UseGuards(AuthGuard)
  async removeEnrolledCourse(
    @Param('id') userId: string,
    @Param('courseId') courseId: string,
  ) {
    try {
      const updatedUser = await this.userService.removeEnrolledCourse(userId, courseId);
      return {
        message: 'Course successfully removed from enrolled courses.',
        user: updatedUser,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // fatma
  @Get('login-attempts')
  //@UseGuards(AuthGuard, RolesGuard) 
  //@Roles('admin' as Role)
  async getLoginAttempts() {
    return this.LoginAttempt.find().sort({ timestamp: -1 }).exec();
  }

<<<<<<< Updated upstream
  @Get('instructor/completed-courses')
async trackCompletedCourses(
  @Query('created_by') createdBy: string,
) {
  try {
    if (!createdBy) {
      throw new BadRequestException('Instructor identifier (created_by) is required.');
    }

    const result = await this.userService.trackInstructorCompletedCourses(createdBy);

    return {
      message: 'Completed courses tracked successfully.',
      ...result,
    };
  } catch (error) {
    throw new BadRequestException(error.message || 'Failed to track completed courses.');
  }
}
=======
  //hannah deleted the tarck complete

>>>>>>> Stashed changes
// Get enrolled courses of a specific student (for instructors)
@Get(':instructorId/student/:studentId/enrolled-courses')
//@UseGuards(AuthGuard, RolesGuard)
//@Roles('instructor' as Role, 'admin' as Role) // Restricted to instructors or admins
async getStudentEnrolledCourses(
  @Param('instructorId') instructorId: string,
  @Param('studentId') studentId: string,
) {
  try {
    // Validate that the requestor is an instructor or admin
    const studentEnrolledCourses = await this.userService.getEnrolledCoursesInstructor(studentId);
    return {
      studentId,
      enrolledCourses: studentEnrolledCourses,
    };
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}

@Get('instructor/search-students')
 // @UseGuards(AuthGuard, RolesGuard)
  //@Roles('instructor' as Role)
  async findStudentByName(
    @Param('instructorId') instructorId: string,
    @Query('name') name: string,
  ) {
    if (!name) {
      throw new BadRequestException('Student name is required');
    }

    try {
      return await this.userService.findStudentByName(name);
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to find students.');
    }
  }

  /**
   * 🔍 Student searching for instructors by name
   * Accessible only by students
   */
  @Get('student/search-instructors')
  //@UseGuards(AuthGuard, RolesGuard)
  //@Roles('student' as Role)
  async findInstructorByName(@Query('name') name: string) {
    if (!name) {
      throw new BadRequestException('Instructor name is required');
    }

    try {
      return await this.userService.findInstructorByName(name);
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to find instructors.');
    }
  }







}