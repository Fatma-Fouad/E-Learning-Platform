import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizSchema } from './quiz.schema';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { ProgressModule } from '../progress/progress.module';
import { QuestionBankSchema } from '../questionbank/questionbank.schema';
import { UserModule } from '../users/user.module';
import { ProgressSchema } from '../progress/progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'quizzes', schema: QuizSchema },
      { name: 'questionbank', schema: QuestionBankSchema, collection: 'questionbank'}, //so i can get the questions
      { name: 'progress', schema: ProgressSchema, collection: 'progress' },
    ]),
    UserModule,
    ProgressModule,
  ],
  exports: [MongooseModule],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
