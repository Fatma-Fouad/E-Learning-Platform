
import { IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  noteTitle?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  last_updated?: Date;

  @IsOptional()
  module_id?: Types.ObjectId;
}
