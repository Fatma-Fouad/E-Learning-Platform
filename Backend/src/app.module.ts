
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
import { NoteModule } from './notes/note.module';
import { ResponseModule } from './responses/response.module';
import { BackupModule } from './backup/backup.module';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports:
    
    [JwtModule.register({
      secret: process.env.JWT_SECRET,  // Ensure you are loading the correct secret from your .env file
      signOptions: { expiresIn: '1h' },  // Optional: Set token expiration time
    }),
      QuizModule,
    QuestionBankModule,
    NoteModule,
    AuthModule,
    ModulesModule,
    CourseModule,
    ProgressModule,
    UserModule,
    ForumModule, // Add ForumsModule here
    ChatModule,
    NotificationModule,
    ResponseModule,
    BackupModule,
    MongooseModule.forRoot('mongodb+srv://softwareproject:sp123@clustersp.wvdbq.mongodb.net/EduLink') ],
    controllers: [AppController],
  providers: [AppService],
}) 
export class AppModule {}

