import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chats.controller';
import { ChatService } from './chats.service';
import { ChatGateway } from './chats';
import { Chat, ChatSchema } from './chats.schema';
import { User, UserSchema } from '../../users/user.schema';
import { NotificationModule } from '../notifications/notification.module';
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Chat.name, schema: ChatSchema },
            { name: User.name, schema: UserSchema },
        ]),
        forwardRef(() => NotificationModule), // Forward reference to NotificationModule
    ],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway],
    exports: [ChatService],
})
export class ChatModule { }
