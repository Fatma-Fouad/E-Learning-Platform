import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './notifications.schema';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notificationGateway';
import { NotificationController } from './notifications.controller';
import { ChatModule } from '.././chats/chats.module'; // Import ChatModule

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
        forwardRef(() => ChatModule), // Use forwardRef to avoid circular dependency
    ],
    providers: [NotificationService, NotificationGateway],
    controllers: [NotificationController],
    exports: [NotificationService, NotificationGateway],
})
export class NotificationModule { }
