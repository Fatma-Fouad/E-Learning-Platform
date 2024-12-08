import { Module } from '@nestjs/common';
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
  controllers: [AuthController],
  providers: [AuthService, UserService],
  exports: [JwtModule, AuthService, UserService],
  imports:[UserModule,
    NotificationModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    MongooseModule.forFeature([
      { name: 'LoginAttempt', schema: LoginAttemptSchema },
    ]),
  ]
})
export class AuthModule {}
