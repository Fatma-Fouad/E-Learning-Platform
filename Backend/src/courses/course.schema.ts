import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';


@Schema()  
export class Courses {

  @Prop({required: true, unique: true})
  Course_ID: string;

  @Prop({required: true})
  Course_Title: string;

  @Prop({required: true})
  Course_Description: string;

  @Prop({required: true})
  Course_Category: string;

  @Prop({required: true, enum: ['Beginner', 'Intermediate', 'Advanced']})
  Course_Difficulty: string;

  @Prop({required: true})
  Course_CreatedBy: string;

  @Prop({ type: Date, default: () => new Date() })   
  Module_CreatedAt: Date;
}

export const CoursesSchema = SchemaFactory.createForClass(Courses);




