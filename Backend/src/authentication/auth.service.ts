import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
  LoginAttempt: any;
    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
      @InjectModel(LoginAttempt.name) private readonly loginAttemptModel: Model<LoginAttempt>,
    ) { }

  async register(user: RegisterUserDto): Promise<string> {
    try {
      const existingUser = await this.usersService.findByEmail(user.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = { ...user, password_hash: hashedPassword };
      console.log('New user to be saved:', newUser);

      await this.usersService.createUser(newUser);

      return 'User registered successfully';
    } catch (error) {
      console.error('Error during registration:', error); // Log the exact error
      throw new InternalServerErrorException('An error occurred during registration');
    }
  }


  async signIn(email: string, password: string): Promise<{ access_token: string, payload: { userid: Types.ObjectId, role: string } }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userid: user._id as Types.ObjectId, role: user.role };

    // Generate the JWT token
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,  // Return the token
      payload
    };
  }


  
}