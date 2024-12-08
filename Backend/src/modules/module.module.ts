import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleSchema } from './module.schema';
import { ModulesController } from './module.controller';
import { ModulesService } from './module.service';
import { CourseSchema } from '../courses/course.schema';
import { courses } from '../courses/course.schema';
import { ProgressSchema } from '../progress/models/progress.schema';
import { CourseModule } from '../courses/course.module';
import { QuestionBankModule } from '../questionbank/questionbank.module';
import { QuizModule } from 'src/quizzes/quiz.module';
import { QuestionBankSchema } from 'src/questionbank/questionbank.schema';
import { QuizSchema } from 'src/quizzes/quiz.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'modules', schema: ModuleSchema },
    { name: 'courses', schema: CourseSchema },
    { name: 'progress', schema: ProgressSchema, collection: 'progress'},
    { name: 'questionbank', schema: QuestionBankSchema},
    { name: 'quizzes', schema: QuizSchema}
  ]),CourseModule, QuestionBankModule, QuizModule],
  exports: [MongooseModule],
  controllers: [ModulesController],
  providers: [ModulesService],
})
export class ModulesModule {}