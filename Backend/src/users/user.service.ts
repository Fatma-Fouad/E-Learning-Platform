import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { users, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(users.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string):Promise<UserDocument> {
    return await this.userModel.findOne({ email }).exec();
  }

  async create(user: any) {
    const newUser = new this.userModel(user);
    return newUser.save();
  }
}


//     async create(studentData: student): Promise<studentDocument> {
//         const newStudent = new this.studentModel(studentData);  // Create a new student document
//         const user=  await newStudent.save()
//         return user;  // Save it to the database
//     }
//     async findByName(username: string):Promise<studentDocument> {
//         return await this.studentModel.findOne({username});  // Fetch a student by username
//     }
//     async findByEmail(email: string):Promise<studentDocument> {
//         const user=await this.studentModel.findOne({email})
//         return user;  // Fetch a student by username
//     }
//     // Get all students
//     async findAll(): Promise<studentDocument[]> {
//         let students= await this.studentModel.find();  // Fetch all students from the database
//         console.log(students)
//         return students
//     }

//     // Get a student by ID
//     async findById(id: string): Promise<studentDocument> {
//         console.log(id)
//         const student=  await this.studentModel.findById(id);  // Fetch a student by ID
//         return student
//     }

//     // Update a student's details by ID
//     async update(id: string, updateData: updateStudentDTo): Promise<studentDocument> {
//         return await this.studentModel.findByIdAndUpdate(id, updateData, { new: true });  // Find and update the student
//     }

//     // Delete a student by ID
//     async delete(id: string): Promise<studentDocument> {
//         return await this.studentModel.findByIdAndDelete(id);  // Find and delete the student
//     }
// }
