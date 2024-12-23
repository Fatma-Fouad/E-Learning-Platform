
export class RegisterUserDto {
    email:string;
    name: string;
    role:string;
    password:string;
    enrolled_courses?: string[];
    completed_courses?: string[];
    gpa?: number;
}
