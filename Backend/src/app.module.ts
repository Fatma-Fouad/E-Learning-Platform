import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizModule } from './quizzes/quiz.module';
import { QuestionBankModule } from './questionbank/questionbank.module';
import { UserModule } from './users/user.module';
import { ProgressModule } from './progress/models/progress.module';
import { AuthModule } from './authentication/auth.module';
import { AuthGuard } from './authentication/auth.guard';
import { BackupService } from './backup/backup.service';
import { BackupController } from './backup/backup.controller';

@Module({
  imports: [ QuizModule, QuestionBankModule, UserModule, ProgressModule, AuthModule, 
    MongooseModule.forRoot('mongodb+srv://softwareproject:sp123@clustersp.wvdbq.mongodb.net/EduLink') ],
    controllers: [AppController, BackupController],
  providers: [AppService, AuthGuard, BackupService],
})
export class AppModule {}
