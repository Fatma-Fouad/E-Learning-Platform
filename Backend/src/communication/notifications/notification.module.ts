import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './notifications.schema';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notificationGateway';
import { NotificationController } from './notifications.controller';
import { ChatModule } from '.././chats/chats.module'; // Import ChatModule
import { User, UserSchema } from '../../users/user.schema'; // Import users schema
import { UserModule } from 'src/users/user.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Notification.name, schema: NotificationSchema },
            { name: User.name, schema: UserSchema },
        ]),
        forwardRef(() => ChatModule), // Avoid circular dependency
    ],
    providers: [
        NotificationService,
        NotificationGateway, // Both services provided
    ],
    controllers: [NotificationController],
    exports: [
        NotificationService,
        NotificationGateway, // Ensure they're exported
    ],
})
export class NotificationModule { }