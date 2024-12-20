
// note.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import { notes, NoteSchema } from './note.schema';
import { courses, CourseSchema } from '../courses/course.schema'; // Import the course schema
import {modules, ModuleSchema} from '../modules/module.schema'
@Module({
  imports: [
    MongooseModule.forFeature([{ name: notes.name, schema: NoteSchema }]),
    MongooseModule.forFeature([{ name: courses.name, schema: CourseSchema }]),
    MongooseModule.forFeature([{ name: modules.name, schema: ModuleSchema }]), // Import your Module schema

  ],
  exports: [MongooseModule], // Export the MongooseModule so it can be used in other modules
  controllers: [NoteController],
  providers: [NoteService],
})
export class NoteModule {}
