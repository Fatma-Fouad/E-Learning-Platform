import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from '../users/registeruser.dto';
import { ObjectId, Types } from 'mongoose';
@Injectable()
export class AuthService {
    constructor(
        private usersService: UserService,
        private jwtService: JwtService
    ) { }

      async register(user: RegisterUserDto): Promise<string> {
        const existingUser = await this.usersService.findByEmail(user.email);
        if (existingUser) {
          throw new ConflictException('Email already exists');
        }
        
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // Initialize role-specific attributes
        if (user.role === 'student') {
          // Initialize courses for students
          user.enrolled_courses = [];
          user.completed_courses = [];
        }else if(user.role === 'instructor'){
          // Initialize courses for instructors
          
        }
        
        const newUser = { ...user, password_hash: hashedPassword};
        console.log('New user to be saved:', newUser);
        await this.usersService.createUser(newUser);
      
        return 'User registered successfully';
      }

    async signIn(email: string, password: string): Promise< {access_token:string,payload:{userid:Types.ObjectId,role:string}}> {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new NotFoundException('User not found');
          }
        console.log("password: ", user.password_hash);
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
          console.log( await bcrypt.compare(password, user.password_hash))
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
          }

        const payload = { userid: user._id as Types.ObjectId, role: user.role };

        return {
            access_token: await this.jwtService.signAsync(payload),
            payload
        };
    }
}