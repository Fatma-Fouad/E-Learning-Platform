import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/users/user.module';
import { JwtModule } from '@nestjs/jwt';
import { LoginAttemptSchema } from './login.schema'; // Ensure correct import
import * as dotenv from 'dotenv';
import { UserService } from 'src/users/user.service';
import { NotificationModule } from 'src/communication/notifications/notification.module';

dotenv.config();

@Module({
  imports: [
    forwardRef(() => UserModule), // Resolve circular dependency with UserModule
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
    MongooseModule.forFeature([
      { name: 'LoginAttempt', schema: LoginAttemptSchema },
    ]),

  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule, MongooseModule],
})
export class AuthModule { }
