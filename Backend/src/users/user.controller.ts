import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../authentication/auth.guard';
import { RolesGuard } from '../authentication/roles.guard';
import { Role, Roles } from '../authentication/roles.decorator';

@Controller('users')
export class UsersController {
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
}
