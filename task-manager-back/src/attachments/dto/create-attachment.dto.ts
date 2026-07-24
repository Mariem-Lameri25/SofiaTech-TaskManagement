import { IsString } from 'class-validator';

export class CreateAttachmentDto {
  @IsString()
  url: string;

  @IsString()
  type: string;

  @IsString()
  taskId: string; // l’ID de la tâche à laquelle la pièce jointe est liée
}
