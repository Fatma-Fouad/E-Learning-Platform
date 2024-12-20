
// note.controller.ts
import { Body, Controller, Post, Get, Param, Put, Delete, UseGuards, NotFoundException  } from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './createnote.dto';
import {UpdateNoteDto} from './updatenote.dto';
import { NoteDocument, notes } from './note.schema'; // Ensure this import matches your schema file
//import { AuthGuard } from 'src/authentication/auth.guard';
//import { Roles, Role } from 'src/authentication/roles.decorator';
//import { RolesGuard } from 'src/authentication/roles.guard';

@Controller('notes') // Base route: /notes
//@UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
//@Roles('admin' as Role, 'student' as Role)
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

@Get('module/:moduleId') // Fetch notes by module ID
async getNotesByModuleId(@Param('moduleId') moduleId: string): Promise<NoteDocument[]> {
  return this.noteService.findByModuleId(moduleId);
}


@Get('note-title/:noteTitle') // Fetch by note title
async getNoteByTitle(@Param('noteTitle') noteTitle: string): Promise<NoteDocument> {
  return this.noteService.findNoteByTitle(noteTitle);
}

  // Endpoint to update a note by its title
  @Put('module/:moduleId/title/:noteTitle') // Update note tied to a module
  async updateNoteByModuleAndTitle(
    @Param('moduleId') moduleId: string,
    @Param('noteTitle') noteTitle: string,
    @Body() updateData: UpdateNoteDto,
  ): Promise<NoteDocument> {
    return this.noteService.updateNoteByModuleAndTitle(moduleId, noteTitle, updateData);
  }

  
  
  @Delete('title/:noteTitle') // Delete by note title
  async deleteNoteByTitle(@Param('noteTitle') noteTitle: string): Promise<NoteDocument> {
    return this.noteService.deleteNoteByTitle(noteTitle);
  }
  
  
}
