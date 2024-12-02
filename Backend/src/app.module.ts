/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizModule } from './quizzes/quiz.module';
import { ForumModule } from './communication/forums/forums.module';
import { ChatModule } from './communication/chats/chats.module';
import { NotificationModule } from './communication/notifications/notification.module';


@Module({
  imports: [
    QuizModule,
    ForumModule, // Add ForumsModule here
    ChatModule,
    NotificationModule,
    MongooseModule.forRoot('mongodb+srv://softwareproject:sp123@clustersp.wvdbq.mongodb.net/EduLink'), // MongoDB connection
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
