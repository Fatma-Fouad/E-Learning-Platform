// note.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { notes, NoteDocument } from './note.schema';
import { courses, CourseDocument } from '../courses/course.schema'; // Import the course schema
import { modules, ModuleDocument } from '../modules/module.schema';
import { CreateNoteDto } from './createnote.dto';
import { UpdateNoteDto } from './updatenote.dto';

@Injectable()
export class NoteService {
  constructor(@InjectModel(notes.name) private noteModel: Model<NoteDocument>,
  @InjectModel(courses.name) private courseModel: Model<CourseDocument>,
  @InjectModel(modules.name) private moduleModel: Model<ModuleDocument>,) {}

  // Create a new note
  async create(createNoteDto: CreateNoteDto): Promise<notes> {
    // Check if the module exists
    const moduleExists = await this.moduleModel.findById(createNoteDto.module_id).exec();

    if (!moduleExists) {
      // Throw an error if the module does not exist
      throw new NotFoundException(`Module with ID "${createNoteDto.module_id}" does not exist`);
    }

    // Create the note
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
// Method to retrieve notes by course ID
async findByModuleId(moduleId: string): Promise<NoteDocument[]> {
  return this.noteModel.find({ moduleId }).exec();
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
async updateNoteByModuleAndTitle(
  moduleId: string,
  noteTitle: string,
  updateData: UpdateNoteDto,
): Promise<NoteDocument> {
  // Ensure module_id is valid
  const moduleObjectId = new Types.ObjectId(moduleId);

  // Ensure content is not empty if provided
  if (updateData.content !== undefined && !updateData.content.trim()) {
    throw new Error('Content cannot be empty.');
  }

  // Update the last_updated timestamp
  updateData.last_updated = new Date();

  // Find and update the note
  const updatedNote = await this.noteModel
    .findOneAndUpdate(
      { module_id: moduleObjectId, noteTitle: { $regex: new RegExp(`^${noteTitle}$`, 'i') } }, // Case-insensitive match
      updateData,
      { new: true },
    )
    .exec();

  if (!updatedNote) {
    throw new NotFoundException(
      `Note with title "${noteTitle}" not found for module ID "${moduleId}".`,
    );
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
