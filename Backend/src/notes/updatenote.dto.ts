import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Content cannot be empty.' }) // Ensure non-empty content
  content?: string;

  @IsOptional()
  @IsString()
  coursetitle?: string; // Course title will be validated in the service
}
