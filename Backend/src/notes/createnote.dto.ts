import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  coursetitle: string;

  @IsNotEmpty()
  @IsString()
  noteTitle: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
