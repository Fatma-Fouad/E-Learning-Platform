// note.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import { notes, NoteSchema } from './note.schema';
import { courses, CourseSchema } from '../courses/course.schema'; // Import the course schema

@Module({
  imports: [
    MongooseModule.forFeature([{ name: notes.name, schema: NoteSchema }]),
    MongooseModule.forFeature([{ name: courses.name, schema: CourseSchema }]),
  ],
  exports: [MongooseModule], // Export the MongooseModule so it can be used in other modules
  controllers: [NoteController],
  providers: [NoteService],
})
export class NoteModule {}
