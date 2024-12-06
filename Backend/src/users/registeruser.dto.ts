import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { courses } from 'src/courses/course.schema';

export class RegisterUserDto {
    email:string;
    name: string;
    role:string;
    password:string;
    enrolled_courses?: string[];
    completed_courses?: string[];
}
