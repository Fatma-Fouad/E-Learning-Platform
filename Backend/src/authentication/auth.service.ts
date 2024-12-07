import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginAttempt } from './login.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserService } from '../users/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from '../users/registeruser.dto';
import { ObjectId, Types } from 'mongoose';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
        @InjectModel('LoginAttempt') private readonly LoginAttempt: Model<LoginAttempt>, // Injected model
    ) { }

      async register(user: RegisterUserDto): Promise<string> {
        const existingUser = await this.usersService.findByEmail(user.email);
        if (existingUser) {
          throw new ConflictException('Email already exists');
        }
        
        const hashedPassword = await bcrypt.hash(user.password, 10);
                
        const newUser = { ...user, password_hash: hashedPassword};
        console.log('New user to be saved:', newUser);
        await this.usersService.createUser(newUser);
      
        return 'User registered successfully';
      }

    async signIn(email: string, password: string): Promise< {access_token:string,payload:{userid:Types.ObjectId,role:string}}> {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
          await this.LoginAttempt.create({
            email,
            status: 'FAILURE',
            reason: 'User not found',
            timestamp: new Date(),
          });
            throw new NotFoundException('User not found');
          }
        console.log("password: ", user.password_hash);
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
          console.log( await bcrypt.compare(password, user.password_hash))
        if (!isPasswordValid) {
          await this.LoginAttempt.create({
            email,
            status: 'FAILURE',
            reason: 'Invalid credentials',
            timestamp: new Date(),
          });
            throw new UnauthorizedException('Invalid credentials');
          }

        const payload = { userid: user._id as Types.ObjectId, role: user.role };

        await this.LoginAttempt.create({
          email,
          status: 'SUCCESS',
          timestamp: new Date(),
        });

        return {
            access_token: await this.jwtService.signAsync(payload),
            payload
        };
    }
}