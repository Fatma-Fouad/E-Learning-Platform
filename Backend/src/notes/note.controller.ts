
// note.controller.ts
import { Body, Controller, Post, Get, Param, Put, Delete, UseGuards, NotFoundException , BadRequestException } from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './createnote.dto';
import {UpdateNoteDto} from './updatenote.dto';
import { NoteDocument, notes } from './note.schema'; // Ensure this import matches your schema file
import { AuthGuard } from 'src/authentication/auth.guard';
import { Roles, Role } from 'src/authentication/roles.decorator';
import { RolesGuard } from 'src/authentication/roles.guard';

@Controller('notes') // Base route: /notes
@UseGuards(AuthGuard, RolesGuard) // Require authentication and specific roles
@Roles('admin' as Role, 'student' as Role)
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
async createOrUpdateNote(@Body() createNoteDto: CreateNoteDto) {
  const note = await this.noteService.createOrUpdate(createNoteDto);
  return note;
}


  @Get('user/:userId') // The userId is passed as a parameter in the URL
  async getAllNotesByUser(@Param('userId') userId: string): Promise<NoteDocument[]> {
    return this.noteService.findAll(userId);
}

@Get('module/:moduleId')
  async getNotesByModuleId(@Param('moduleId') moduleId: string): Promise<{ message: string; data: NoteDocument[] }> {
    console.log(`Fetching notes for moduleId: ${moduleId}`);
    const notes = await this.noteService.findByModuleId(moduleId);

    return {
      message: notes.length > 0 ? 'Notes retrieved successfully.' : 'No notes found for this module.',
      data: notes,
    };
  }



  @Get('module/:moduleId/notes/note-title/:noteTitle')
  async getNoteByModuleIdAndTitle(
    @Param('moduleId') moduleId: string,
    @Param('noteTitle') noteTitle: string,
  ): Promise<NoteDocument> {
    console.log(`Fetching note for moduleId: ${moduleId}, noteTitle: ${decodeURIComponent(noteTitle)}`);
    return this.noteService.findNoteByModuleIdAndTitle(
      moduleId,
      decodeURIComponent(noteTitle.trim())
    );
  }
  

  // Endpoint to update a note by its title
  @Put('module/:moduleId/title/:noteTitle') // ✅ Update Note by Module ID and Title
  async updateNoteByModuleAndTitle(
    @Param('moduleId') moduleId: string,
    @Param('noteTitle') noteTitle: string,
    @Body() updateData: UpdateNoteDto,
  ): Promise<NoteDocument> {
    console.log(
      `🔄 Received update request for moduleId: ${moduleId}, noteTitle: ${noteTitle}, updateData: ${JSON.stringify(updateData)}`
    );
    return this.noteService.updateNoteByModuleAndTitle(
      moduleId,
      decodeURIComponent(noteTitle.trim()),
      updateData
    );
  }
  
  
  @Delete('title/:noteTitle') // Delete by note title
  async deleteNoteByTitle(@Param('noteTitle') noteTitle: string): Promise<NoteDocument> {
    return this.noteService.deleteNoteByTitle(noteTitle);
  }
  
  
}
