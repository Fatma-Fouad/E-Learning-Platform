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
        forwardRef(() => ChatModule), // Resolve circular dependency with ChatModule
        forwardRef(() => UserModule), // Resolve circular dependency with UserModule
    ],
    providers: [NotificationService, NotificationGateway],
    controllers: [NotificationController],
    exports: [NotificationService, NotificationGateway],
})
export class NotificationModule { }

