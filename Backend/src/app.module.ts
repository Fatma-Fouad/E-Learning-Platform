/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizModule } from './quizzes/quiz.module';
import { QuestionBankModule } from './questionbank/questionbank.module';
import { CourseModule } from './courses/course.module';
import { ModulesModule } from './modules/module.module';
import { UserModule } from './users/user.module';
import { ProgressModule } from './progress/models/progress.module';
import { ForumModule } from './communication/forums/forums.module';
import { ChatModule } from './communication/chats/chats.module';
import { NotificationModule } from './communication/notifications/notification.module';import { AuthModule } from './authentication/auth.module';
import { AuthGuard } from './authentication/auth.guard';
import { BackupService } from './backup/backup.service';
import { BackupController } from './backup/backup.controller';
import { NoteModule } from './notes/note.module';


@Module({
  imports: [QuizModule,
    QuestionBankModule,
    NoteModule,
    AuthModule,
    ModulesModule,
    CourseModule,
    ModulesModule,
    ProgressModule,
    UserModule,
    ForumModule, // Add ForumsModule here
    ChatModule,
    NotificationModule,

    MongooseModule.forRoot('mongodb+srv://softwareproject:sp123@clustersp.wvdbq.mongodb.net/EduLink') ],
    controllers: [AppController],
  providers: [AppService],
}) 
export class AppModule {}

