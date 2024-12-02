// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
// import { UsersModule } from '../users/user.module';
// import { AuthGuard } from './auth.guard';
// import { RolesGuard } from './roles.guard';

// @Module({
//   imports: [
//     UsersModule,
//     JwtModule.register({
//       secret: 'your_jwt_secret', // Replace with a secure secret
//       signOptions: { expiresIn: '1h' },
//     }),
//   ],
//   controllers: [AuthController],
//   providers: [
//     AuthService,
//     AuthGuard, // Register the authentication guard
//     RolesGuard, // Register the roles-based authorization guard
//   ],
//   exports: [
//     AuthService, // Allow other modules to use authentication services
//     AuthGuard,
//     RolesGuard,
//     JwtModule, // Export JwtModule for other modules (e.g., UsersModule)
//   ],
// })
// export class AuthModule {}


import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/user.module';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports:[UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
  ]
})
export class AuthModule {}
