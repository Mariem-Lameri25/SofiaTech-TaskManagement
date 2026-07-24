import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateSubtaskDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @IsString()
  taskId: string;
}
