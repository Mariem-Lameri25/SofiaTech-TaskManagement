import { IsString, IsInt, IsDateString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  contenu: string;

  @IsDateString()
  dateCreation: Date;

  @IsInt()
  userId: number;

  @IsString()
  taskId: string;
}