import { Controller, Get, Put, Post, Delete, Param, BadRequestException , Body , UseGuards} from '@nestjs/common';
import { AuthGuard } from '../authentication/auth.guard';
import { UserService } from './user.service';
import { ForbiddenException , NotFoundException } from '@nestjs/common';
import { RolesGuard } from '../authentication/roles.guard';
import { Role, Roles } from '../authentication/roles.decorator';
import { LoginAttempt } from '../authentication/login.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';


@Controller('user')

export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectModel('LoginAttempt') private readonly LoginAttempt: Model<LoginAttempt>, // Correct injection
    ) {}
// fatma
  @Get('users')
  @UseGuards(AuthGuard) // Require authentication
  getProfile() {
    return { message: 'This is a protected route' };
  }

  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
  @Roles('admin' as Role)  // Only admins can access this route
  getAdminData() {
    return { message: 'This is an admin-only route' };
  }
  
// hana
@Post(':id/enroll-course/:courseId')
@UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
@Roles('admin' as Role, 'student' as Role)
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
 

//admin , student, instrctor
@Get(':id/profile')
@UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
async getUserProfile(@Param('id') userId: string) {
  try {
    return await this.userService.getUserProfile(userId);
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}
//admin , student, instrctor
@Get()
@UseGuards(AuthGuard, RolesGuard)
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
@UseGuards(AuthGuard, RolesGuard)
@Roles('instructor' as Role, 'student' as Role)
async updateUserProfile(@Param('id') userId: string, @Body() updateData: any) {
  if (Object.keys(updateData).length === 0) {
    throw new BadRequestException('Update data cannot be empty');
  }

  // Optional: Validate if only allowed fields (other than email and role) are passed
  const { email, role,created_at,completed_courses,enrolled_courses,gpa,...filteredUpdateData } = updateData;
  if (email || role || created_at || completed_courses||enrolled_courses|| gpa ) {
    throw new BadRequestException('cannot be updated ');
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
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin' as Role, 'student' as Role)
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
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin' as Role, 'student' as Role)
  async getCompletedCourses(@Param('id') userId: string) {
    try {
      return await this.userService.getCompletedCourses(userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }



// Create a new account (student/instructor) - admin
@UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
@Roles('admin' as Role)  // Only admins can access this route
@Post('/accounts/:role')
async createAccount(@Param('role') role: string, @Body() createUserDto: any) {
  try {
    return await this.userService.createUser(createUserDto);
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}

// Update an existing account -admin
@UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
@Roles('admin' as Role)  // Only admins can access this route
@Put('/accounts/:role/:id')
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
@UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
@Roles('admin' as Role)  // Only admins can access this route
@Delete('/accounts/:role/:id')
async deleteAccount(@Param('role') role: string, @Param('id') userId: string) {
  try {
    return await this.userService.deleteUser(userId);
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}

//admin , instrctor
@Post(':instructorId/enroll-student/:studentId/:courseId')
@UseGuards(AuthGuard, RolesGuard)
@Roles('instructor' as Role, 'admin' as Role)
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

  // fatma
  @Get('login-attempts')
  @UseGuards(AuthGuard, RolesGuard) 
  @Roles('admin' as Role)
  async getLoginAttempts() {
    return this.LoginAttempt.find().sort({ timestamp: -1 }).exec();
  }

}