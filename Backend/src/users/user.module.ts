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
import { AuthModule } from '../authentication/auth.module'; // Import AuthModule
import { QuizModule } from 'src/quizzes/quiz.module';


@Module({
  imports: [
    forwardRef(() => NotificationModule), // Import NotificationModule first
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: courses.name, schema: CourseSchema },
      { name: 'responses', schema: ResponseSchema },
      { name: 'progress', schema: ProgressSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: 'loginAttempt', schema: LoginAttemptSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, MongooseModule],
})
export class UserModule { }


