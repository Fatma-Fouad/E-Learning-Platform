// note.controller.ts
import { Body, Controller, Post, Get, Param, Put, Delete } from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './createnote.dto';
import {UpdateNoteDto} from './updatenote.dto';
import { NoteDocument, notes } from './note.schema'; // Ensure this import matches your schema file

@Controller('notes') // Base route: /notes
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post() // POST /notes
  async createNote(@Body() createNoteDto: CreateNoteDto) {
    const newNote = await this.noteService.create(createNoteDto);
    return newNote; // Return the newly created note
  }

  @Get('user/:userId') // The userId is passed as a parameter in the URL
  async getAllNotesByUser(@Param('userId') userId: string): Promise<NoteDocument[]> {
    return this.noteService.findAll(userId);
}

@Get('course-title/:coursetitle') // Fetch notes by course title
async getNotesByCourseTitle(@Param('coursetitle') coursetitle: string): Promise<NoteDocument[]> {
  return this.noteService.findAllNotesByCourse(coursetitle);
}


@Get('note-title/:noteTitle') // Fetch by note title
async getNoteByTitle(@Param('noteTitle') noteTitle: string): Promise<NoteDocument> {
  return this.noteService.findNoteByTitle(noteTitle);
}

  // Endpoint to update a note by its ID
  @Put('title/:noteTitle')
  async updateNoteByTitle(
    @Param('noteTitle') noteTitle: string,
    @Body() updateData: UpdateNoteDto,
  ): Promise<NoteDocument> {
    return this.noteService.updateNoteByTitle(noteTitle, updateData);
  }
  
  
  @Delete('title/:noteTitle') // Delete by note title
  async deleteNoteByTitle(@Param('noteTitle') noteTitle: string): Promise<NoteDocument> {
    return this.noteService.deleteNoteByTitle(noteTitle);
  }
  
  
}
