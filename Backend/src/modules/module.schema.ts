import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
//import { courses } from '../../courses/courses.schema.ts';

@Schema()  
export class modules {

  @Prop({type: mongoose.Schema.Types.ObjectId, required: true, unique: true})
  module_id: mongoose.Schema.Types.ObjectId;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref:'courses',required: true,unique: true})
  course_id: mongoose.Schema.Types.ObjectId ;

  @Prop({required: true})
  title: string;

  @Prop({required: true})
  content: string;

  @Prop({ type: Date, default: () => new Date() })   
  created_at: Date;
}

export const ModulesSchema = SchemaFactory.createForClass(modules);
