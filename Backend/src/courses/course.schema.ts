import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
 import { UserSchema } from '../users/user.schema';
import mongoose, { HydratedDocument } from 'mongoose';
import { modules } from '../modules/module.schema';


export type CourseDocument = HydratedDocument<courses>;

@Schema()  
export class courses {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true})
  instructor_id: mongoose.Schema.Types.ObjectId; 

  @Prop({required: true})
  title: string;

  @Prop({required: true})
  description: string;

  @Prop({required: true})
  category: string;

  @Prop({required: true})
  created_by: string;

  @Prop({ type: Date, default: () => new Date() })   
  created_at: Date;

  @Prop({ type: Number, default: 0, required:true})
  completed_students: number;

  @Prop({ type: Number, default: 0, required:true })
  nom_of_modules: number;
  
  @Prop({ type: Number, default: 0, required: true })
  enrolled_students: number;

  @Prop({ type: Number, default: 0, required: true })
  course_rating: number;

  @Prop({ type: Number, default: 0, required: true })
  instructor_rating: number;

  @Prop({ default: false })
  isOutdated: boolean; // Flag for version control

  @Prop({ default: 1 })
  version: number; // Version of the course

  @Prop({ type: [String], default: [] })
  multimedia: string[]; // Array to store file paths or URLs

  @Prop({ type: [Object], default: [] })
  previousVersions: Record<string, any>[]; // Array of previous version details

}

export const CourseSchema = SchemaFactory.createForClass(courses);




