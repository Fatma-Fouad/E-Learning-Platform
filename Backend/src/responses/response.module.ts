import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseSchema } from './response.schema';
import { QuizSchema } from '../quizzes/quiz.schema';
import { ProgressSchema } from '../progress/progress.schema';
import { ResponseController } from './response.controller';
import { ResponseService } from './response.service';
import { ModuleSchema } from 'src/modules/module.schema';
import { CourseSchema } from 'src/courses/course.schema';
import { UserSchema } from '../users/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'responses', schema: ResponseSchema },
      { name: 'quizzes', schema: QuizSchema },
      { name: 'progress', schema: ProgressSchema },
      { name: 'modules', schema: ModuleSchema },
      { name: 'courses', schema: CourseSchema },
      { name: 'users', schema: UserSchema },
    ]),
  ],
  controllers: [ResponseController],
  providers: [ResponseService],
})
export class ResponseModule {}
