import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizSchema } from './quiz.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'quizzes', schema: QuizSchema }]),
  ],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
