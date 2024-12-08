import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './user.schema';
import { ResponseSchema } from '../responses/response.schema';
import { courses, CourseSchema } from '../courses/course.schema';
import { LoginAttemptSchema } from '../authentication/login.schema'; 
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
        { name: 'progress', schema: ProgressSchema, collection: 'progress' },
        { name: 'LoginAttempt', schema: LoginAttemptSchema },
        { name: Notification.name, schema: NotificationSchema }, // Add Notification schema
      ]),NotificationModule,
    ],
    controllers: [UserController], // UserController is here
    providers: [UserService],
    exports: [UserService, MongooseModule]
  })
  export class UserModule {
    
  }
  