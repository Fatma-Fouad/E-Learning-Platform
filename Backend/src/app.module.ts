import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizModule } from './quizzes/quiz.module';
import { QuestionBankModule } from './questionbank/questionbank.module';
import { UserModule } from './users/user.module';
import { ProgressModule } from './progress/progress.module';

@Module({
  imports: [ QuizModule, QuestionBankModule, UserModule, ProgressModule,
    MongooseModule.forRoot('mongodb+srv://softwareproject:sp123@clustersp.wvdbq.mongodb.net/EduLink') ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
