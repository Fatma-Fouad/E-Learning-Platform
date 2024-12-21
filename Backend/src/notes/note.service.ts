// note.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { notes, NoteDocument } from './note.schema';
import { courses, CourseDocument } from '../courses/course.schema'; // Import the course schema
import { modules, ModuleDocument } from '../modules/module.schema';
import { CreateNoteDto } from './createnote.dto';
import { UpdateNoteDto } from './updatenote.dto';
import mongoose from 'mongoose';

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


// Method to retrieve notes by course ID
async findByModuleId(moduleId: string): Promise<NoteDocument[]> {
  try {
    const notes = await this.noteModel.find({ module_id: moduleId }).exec();
    // Return an empty array instead of throwing an exception
    return notes || [];
  } catch (error) {
    console.error('Error fetching notes by module ID:', error.message);
    throw new NotFoundException(`Failed to fetch notes for module ID "${moduleId}"`);
  }
}




// Method to retrieve a single note by its title
async findNoteByModuleIdAndTitle(
  moduleId: string,
  noteTitle: string,
): Promise<NoteDocument> {
  console.log(`Searching for note with moduleId: ${moduleId}, noteTitle: ${noteTitle}`);
  // Search for the note with exact title and module ID match (case-insensitive)
  const note = await this.noteModel
    .findOne({
      module_id: new mongoose.Types.ObjectId(moduleId), // Ensure moduleId is ObjectId
      noteTitle: { $regex: `^${noteTitle}$`, $options: 'i' }, // Case-insensitive exact match
    })
    .exec();
  if (!note) {
    throw new NotFoundException(
      `Note with title "${noteTitle}" not found for module ID "${moduleId}".`
    );
  }

  console.log('Note found:', note);
  return note;
}


// Method to update a note by its title
async updateNoteByModuleAndTitle(
  moduleId: string,
  noteTitle: string,
  updateData: UpdateNoteDto,
): Promise<NoteDocument> {
  try {
    // Validate moduleId
    if (!Types.ObjectId.isValid(moduleId)) {
      throw new BadRequestException('Invalid Module ID');
    }

    const moduleObjectId = new Types.ObjectId(moduleId);

    // Validate content
    if (updateData.content !== undefined && updateData.content.trim() === '') {
      throw new BadRequestException('Content cannot be empty.');
    }

    // Validate noteTitle
    if (updateData.noteTitle !== undefined && updateData.noteTitle.trim() === '') {
      throw new BadRequestException('Note title cannot be empty.');
    }

    // Set last_updated field
    updateData.last_updated = new Date();

    console.log(`🔄 Updating note for moduleId: ${moduleId}, noteTitle: ${noteTitle}`);

    const updatedNote = await this.noteModel.findOneAndUpdate(
      {
        module_id: moduleObjectId,
        noteTitle: { $regex: new RegExp(`^${noteTitle}$`, 'i') }, // Case-insensitive match
      },
      { $set: updateData },
      { new: true }
    ).exec();

    if (!updatedNote) {
      throw new NotFoundException(
        `Note with title "${noteTitle}" not found for module ID "${moduleId}".`
      );
    }

    console.log('✅ Note updated successfully:', updatedNote);
    return updatedNote;
  } catch (error) {
    console.error('❌ Error updating note:', error.message);
    throw error;
  }
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
