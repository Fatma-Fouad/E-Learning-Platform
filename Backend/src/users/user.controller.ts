import { Controller, Get, Put, Post, Delete, Param, BadRequestException , Body } from '@nestjs/common';
import { UserService } from './user.service';
import { ForbiddenException , NotFoundException } from '@nestjs/common';



@Controller('user')

export class UserController {
  constructor(private readonly userService: UserService) {}
  

  @Post(':id/enroll-course/:courseId')
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


  
  @Get()
  async getAllUser() {
    try {
      return await this.userService.getAllUsers();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Get user profile with error handling
  @Get(':id/profile')
  async getUserProfile(@Param('id') userId: string) {
    try {
      return await this.userService.getUserProfile(userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Update user profile with error handling
@Put(':id/profile')
async updateUserProfile(@Param('id') userId: string, @Body() updateData: any) {
  if (Object.keys(updateData).length === 0) {
    throw new BadRequestException('Update data cannot be empty');
  }

  // Optional: Validate if only allowed fields (other than email and role) are passed
  const { email, role,created_at,completed_courses,enroll_course,...filteredUpdateData } = updateData;
  if (email || role || created_at || completed_courses||enroll_course ) {
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


  // Get enrolled courses for a user
  @Get(':id/enrolled-courses')
  async getEnrolledCourses(@Param('id') userId: string) {
    try {
      return await this.userService.getEnrolledCourses(userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Get completed courses for a user
  @Get(':id/completed-courses')
  async getCompletedCourses(@Param('id') userId: string) {
    try {
      return await this.userService.getCompletedCourses(userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id/remove-course/:courseId')
async removeEnrolledCourse(
  @Param('id') userId: string,
  @Param('courseId') courseId: string
) {
  try {
    return await this.userService.removeEnrolledCourse(userId, courseId);
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}

  


// Create a new account (student/instructor) - admin
@Post('/accounts/:role')
async createAccount(@Param('role') role: string, @Body() createUserDto: any) {
  try {
    return await this.userService.createUser(createUserDto);
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}

// Update an existing account -admin
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
@Delete('/accounts/:role/:id')
async deleteAccount(@Param('role') role: string, @Param('id') userId: string) {
  try {
    return await this.userService.deleteUser(userId);
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}}