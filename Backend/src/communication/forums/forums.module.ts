import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ForumsController } from './forums.controller';
import { ForumsService } from './forums.service';
import { Forum, ForumSchema } from './fourms.schema';
import { NotificationGateway } from '../notifications/notificationGateway'; // Import the NotificationGateway
import { NotificationService } from '../notifications/notification.service'; // Import NotificationService
import { Notification, NotificationSchema } from '../notifications/notifications.schema'; // Import Notification schema
import { User, UserSchema } from '../../users/user.schema'; // Import users schema

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Forum', schema: ForumSchema },
            { name: User.name, schema: UserSchema },
            { name: 'Notification', schema: NotificationSchema }, // Include Notification schema
        ]),
    ],
    controllers: [ForumsController],
    providers: [ForumsService, NotificationGateway, NotificationService], // Add NotificationGateway and NotificationService
})
export class ForumModule { }
