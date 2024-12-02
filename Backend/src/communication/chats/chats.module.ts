import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chats.controller';
import { ChatService } from './chats.service';
import { ChatGateway } from './chats';
import { Chat, ChatSchema } from './chats.schema';
import { users, UserSchema } from '../../users/user.schema';
import { NotificationModule } from '../notifications/notification.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Chat.name, schema: ChatSchema },
            { name: users.name, schema: UserSchema },
        ]),
        forwardRef(() => NotificationModule), // Use forwardRef to avoid circular dependency
    ],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway], // Only provide what's specific to ChatModule
    exports: [ChatService], // Export ChatService for use in other modules
})
export class ChatModule { }
