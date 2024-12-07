import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './user.schema';
import { ResponseSchema } from '../responses/response.schema';
import { courses, CourseSchema } from '../courses/course.schema';
import { progress, ProgressSchema } from '../progress/models/progress.schema';
import { Notification, NotificationSchema } from '../communication/notifications/notifications.schema';
import { NotificationService } from '../communication/notifications/notification.service';
import { NotificationModule } from '../communication/notifications/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: courses.name, schema: CourseSchema },
      { name: 'responses', schema: ResponseSchema },
      { name: progress.name, schema: ProgressSchema },
      { name: Notification.name, schema: NotificationSchema }, // Add Notification schema
    ]),
    forwardRef(() => NotificationModule), // Import NotificationModule to resolve dependencies
  ],
  controllers: [UserController],
  providers: [UserService, NotificationService], // Include NotificationService if used in UserService
  exports: [UserService], // Export UserService if needed elsewhere
})
export class UserModule { }
