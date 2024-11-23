import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';


@Schema()  
export class courses {

  @Prop({required: true, unique: true})
  course_id: string;

  @Prop({required: true})
  course_title: string;

  @Prop({required: true})
  course_description: string;

  @Prop({required: true})
  course_category: string;

  @Prop({required: true, enum: ['Beginner', 'Intermediate', 'Advanced']})
  course_difficulty: string;

  @Prop({required: true})
  course_createdBy: string;

  @Prop({ type: Date, default: () => new Date() })   
  Module_CreatedAt: Date;
}

export const CoursesSchema = SchemaFactory.createForClass(courses);




