import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizSchema } from './quiz.schema';
import { ModulesModule } from '../modules/module.module'; 

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'quizzes', schema: QuizSchema }]),
    ModulesModule,
  ],
  exports: [MongooseModule],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
