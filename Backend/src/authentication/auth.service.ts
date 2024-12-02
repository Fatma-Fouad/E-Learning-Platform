import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from '../users/registeruser.dto';
import { ObjectId, Types } from 'mongoose';
@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }
    async register(user: RegisterUserDto): Promise<string> {
        const existingUser = await this.usersService.findByEmail(user.email);
        if (existingUser) {
          throw new ConflictException('email already exists');
        }
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const newUser: RegisterUserDto = { ...user, password: hashedPassword };
        await this.usersService.create(newUser);
        return 'registered successfully';
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

        const payload = { userid: user._id, role: user.role };

        return {
            access_token: await this.jwtService.signAsync(payload),
            payload
        };
    }
}