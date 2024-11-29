// note.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { notes, NoteDocument } from './note.schema';
import { courses, CourseDocument } from '../courses/course.schema'; // Import the course schema
import { CreateNoteDto } from './createnote.dto';

@Injectable()
export class NoteService {
  constructor(@InjectModel(notes.name) private noteModel: Model<NoteDocument>,
  @InjectModel(courses.name) private courseModel: Model<CourseDocument>,) {}

  // Create a new note
  async create(createNoteDto: CreateNoteDto): Promise<notes> {
    // Check if the course exists using the title
    const courseExists = await this.courseModel.findOne({ title: createNoteDto.coursetitle }).exec();
    
    if (!courseExists) {
      // Throw an error if the course does not exist
      throw new NotFoundException(`Course with title "${createNoteDto.coursetitle}" does not exist`);
    }
  
    // Create the note if the course exists
    const newNote = new this.noteModel({
      ...createNoteDto,
      created_at: new Date(),
      last_updated: new Date(),
    });
  
    return newNote.save();
  }

  // Fetch all notes
  async findAll(userId: string): Promise<NoteDocument[]> {
    return this.noteModel.find({ user_id: userId }).exec();
  }

  // Method to retrieve notes by course title
async findAllNotesByCourse(coursetitle: string): Promise<NoteDocument[]> {
  const notes = await this.noteModel.find({ coursetitle }).exec(); // Use correct field name
  
  if (notes.length === 0) { // Check if no notes were found
    throw new NotFoundException(`No notes found for course title: ${coursetitle}`);
  }

  return notes; // Return the list of notes
}


// Method to retrieve a single note by its title
async findNoteByTitle(noteTitle: string): Promise<NoteDocument> {
  const note = await this.noteModel
    .findOne({ noteTitle: { $regex: new RegExp(`^${noteTitle}$`, 'i') } }) // Case-insensitive match
    .exec();

  if (!note) {
    throw new NotFoundException(`Note with title "${noteTitle}" not found`);
  }

  return note;
}
// Method to update a note by its title
async updateNoteByTitle(noteTitle: string, updateData: Partial<notes>): Promise<NoteDocument> {
  updateData.last_updated = new Date(); // Update the last_updated field

  const updatedNote = await this.noteModel
    .findOneAndUpdate(
      { noteTitle: { $regex: new RegExp(`^${noteTitle}$`, 'i') } }, // Case-insensitive match
      updateData,
      { new: true }
    )
    .exec();

  if (!updatedNote) {
    throw new NotFoundException(`Note with title "${noteTitle}" not found`);
  }

  return updatedNote;
}


// Method to delete a note by its title
async deleteNoteByTitle(noteTitle: string): Promise<NoteDocument> {
  const deletedNote = await this.noteModel
    .findOneAndDelete({ noteTitle: { $regex: new RegExp(`^${noteTitle}$`, 'i') } }) // Case-insensitive match
    .exec();

  if (!deletedNote) {
    throw new NotFoundException(`Note with title "${noteTitle}" not found`);
  }

  return deletedNote;
}


}
