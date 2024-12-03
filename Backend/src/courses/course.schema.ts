import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CourseDocument = HydratedDocument<courses>;

@Schema()  
export class courses {

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

  @Prop({ type: Number, default: 0, required:true})
  completed_students: number;

  @Prop({ type: Number, default: 0, required:true })
  nom_of_modules: number;
}

export const CourseSchema = SchemaFactory.createForClass(courses);




