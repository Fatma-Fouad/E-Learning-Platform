import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { UserSchemas } from '../../users/user.schema';
import mongoose, { HydratedDocument } from 'mongoose';

export type CourseDocument = HydratedDocument<courses>;

@Schema()  
export class courses {

  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true})
  // instructor_id: mongoose.Schema.Types.ObjectId; 

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

  @Prop({ type: Number, default: 0, required: true })
  enrolled_students: number;

  @Prop({ type: Number, default: 0, required: true })
  nom_of_modules: number;

  @Prop({ type: Number, default: 0, required: true })
  course_rating: number;

  @Prop({ type: Number, default: 0, required: true })
  instructor_rating: number;
}

export const CourseSchema = SchemaFactory.createForClass(courses);




