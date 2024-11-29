import { IsOptional, IsString } from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  coursetitle?: string;
}
