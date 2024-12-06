import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './user.schema';
import { ResponseSchema } from '../responses/response.schema'
import { courses, CourseSchema } from '../courses/course.schema';
import { ProgressSchema } from '../progress/models/progress.schema';

@Module({
    imports: [
      MongooseModule.forFeature([
        { name: User.name, schema: UserSchema },
        { name: courses.name, schema: CourseSchema },
        { name: 'responses', schema: ResponseSchema },
        { name: 'progress', schema: ProgressSchema, collection: 'progress' },
      ]),
    ],
    controllers: [UserController], // UserController is here
    providers: [UserService],
  })
  export class UserModule {
    
  }
  