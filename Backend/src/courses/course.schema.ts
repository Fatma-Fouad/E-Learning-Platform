import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { users } from '../users/user.schema';

export type CourseDocument = HydratedDocument<courses>;

@Schema()  
export class courses {

  // MongoDB automatically adds `_id`, so no need to explicitly declare it.
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true })
  instructor_id: mongoose.Schema.Types.ObjectId; 

  @Prop({required: true})
  title: string;

  @Prop({required: true})
  description: string;

  @Prop({required: true})
  category: string;

  @Prop({required: true, enum: ['Beginner', 'Intermediate', 'Advanced']})
  difficulty_level: string;

  @Prop({required: true})
  created_by: string;

  @Prop({ type: Date, default: () => new Date() })   
  created_at: Date;

  @Prop({ type: Number, default: 0, min: 0, max: 5, required:true })
  course_rating: number; // Overall course rating (1-5 stars)

  @Prop({ type: [String], default: [], required:true })
  comments: string[];

  @Prop({ default: 0 })
  ratingCount: number; // Number of ratings submitted

  @Prop({ type: Number, default: 0, required:true})
  enrolled_students: number; 
  
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'users', default: [] })
  enrolled_student_ids: mongoose.Schema.Types.ObjectId[]; // Array of student IDs

  @Prop({ type: Number, default: 0, required:true })
  nom_of_modules: number;

  @Prop({ type: Number, default: 0, required: true })
  instructor_rating: number;

  @Prop({ type: Number, default: 0, required: true })
  instructor_ratingCount: number; 

  @Prop({ type: Number, default: 0, required:true})
  completed_students: number; 

}

export const CourseSchema = SchemaFactory.createForClass(courses)