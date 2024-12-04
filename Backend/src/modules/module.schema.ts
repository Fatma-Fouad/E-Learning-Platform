import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { courses } from '../courses/course.schema';

export type ModuleDocument = HydratedDocument<modules>;

@Schema()  
export class modules {

  @Prop({type: mongoose.Schema.Types.ObjectId, ref:'courses',required: true})
  course_id: mongoose.Schema.Types.ObjectId;

  @Prop({required: true})
  title: string;

  @Prop({required: true})
  content: string;

  @Prop({ type: Date, default: () => new Date() })   
  created_at: Date;

  @Prop({ type: Number, required: true, unique: true, min: 1 })
  module_order: number;
}

export const ModuleSchema = SchemaFactory.createForClass(modules);
