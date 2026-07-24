import { IsString, IsInt } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  contenu: string;

  @IsInt()
  userId: number;
}