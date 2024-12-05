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

  @Prop({ type: [String], default: [] })
   content: string[];


  @Prop({ type: Date, default: () => new Date() })   
  created_at: Date;

  @Prop({ type: Number, default: 0, min: 0, max: 5, required:true })
   module_rating: number; // Overall course rating (1-5 stars)

   @Prop({ default: 0 })
  module_ratingCount: number; // Number of ratings submitted

  @Prop({ default: false })
  isModuleOutdated: boolean; // Flag for version control

  @Prop({ default: 1 })
  module_version: number; // Version of the course

  
  @Prop({ type: [Object], default: [] })
modules_previousVersions: Record<string, any>[]; // Array of previous version details


  @Prop({ type: String, enum: ['Easy', 'Medium', 'Hard'] }) // New field
  module_difficultyLevel: string;
}

export const ModuleSchema = SchemaFactory.createForClass(modules);