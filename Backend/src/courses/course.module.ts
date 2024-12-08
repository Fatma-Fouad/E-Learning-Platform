import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesController } from './course.controller';
import { CoursesService } from './course.service';
import { courses, CourseSchema } from './course.schema';
import { progress, ProgressSchema } from '../progress/models/progress.schema';
import { MulterModule } from '@nestjs/platform-express';
import { UserSchema } from '../users/user.schema';
import { ModulesModule } from '../modules/module.module';
import { ModuleSchema } from '../modules/module.schema';
import { modules } from '../modules/module.schema';
import { User } from '../users/user.schema';
import { NotificationModule } from '../communication/notifications/notification.module'; // Import NotificationModuleimport { users } from '../users/user.schema';



@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'courses', schema: CourseSchema },
      { name: 'progress', schema: ProgressSchema },
      { name: 'users', schema: UserSchema },
      { name: 'modules', schema: ModuleSchema },
    ]),
    MulterModule.register({
      dest: './uploads',
    }),
    NotificationModule, // Import NotificationModule to resolve NotificationService
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],  
})
export class CourseModule { }
