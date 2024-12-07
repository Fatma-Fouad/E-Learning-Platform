import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesController } from './course.controller';
import { CoursesService } from './course.service';
import { courses, CourseSchema } from './course.schema';
import { progress, ProgressSchema } from '../progress/progress.schema'; 
import { MulterModule } from '@nestjs/platform-express';
import { UserSchema } from '../users/user.schema'; 
import { ModulesModule } from '../modules/module.module';
import { ModuleSchema } from '../modules/module.schema'; 
import { modules } from '../modules/module.schema';
import { users } from '../users/user.schema';
//import { NotificationModule } from '../communication/notifications/notification.module'; // Import NotificationModule


@Module({
  imports: [
    // Registering the Mongoose schema for courses
    MongooseModule.forFeature([
      { name: 'courses', schema: CourseSchema},
      { name: 'progress', schema: ProgressSchema }, 
      { name: 'users', schema: UserSchema }, 
      {name:'modules', schema: ModuleSchema},
    ]),
    // Multer Module for file uploads
    MulterModule.register({
      dest: './uploads', // Directory for file uploads
    }),
    //NotificationModule, // Import NotificationModule to resolve NotificationService
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],   // Exporting the service if other modules need it
})
export class CourseModule {}

