import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizModule } from './quizzes/quiz.module';
import { QuestionBankModule } from './questionbank/questionbank.module';
import { CourseModule } from './courses/course.module';
import { ModulesModule } from './modules/module.module';
import { ProgressModule } from './progress/progress.module';
import { UserModule } from './users/user.module';
import { ResponseModule } from './responses/response.module';

@Module({
  imports: [ QuizModule, QuestionBankModule,ModulesModule,ProgressModule, UserModule, ResponseModule, CourseModule,
    MongooseModule.forRoot('mongodb+srv://softwareproject:sp123@clustersp.wvdbq.mongodb.net/EduLink') ],
    controllers: [AppController],
  providers: [AppService],
}) 
export class AppModule {}
