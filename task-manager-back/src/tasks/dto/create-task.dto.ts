import {
  IsEnum,
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';
import { TaskStatus } from '../taskStatus';
import { TaskPriority } from '../taskPriority';
import { SubTask } from 'src/subtasks/subtask.entity';

export class CreateTaskDto {
  @IsString()
  nom: string;

  @IsString()
  description: string;

  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsDateString()
  dateCreation: Date;

  @IsDateString()
  dateDebut: Date;

  @IsDateString()
  dateFin: Date;

  @IsEnum(TaskPriority)
  priorite: TaskPriority;

  @IsString()
  location: string;

  @IsNumber() // Changed from @IsString()
  projectId: number; // Changed from string

 // @IsNumber() // Changed from @IsString()
  //createdById: number; // Changed from string

  @IsNumber() // Changed from @IsString()
  assignedToId: number; // Changed from string

  @IsOptional()
  @IsArray()
  subtasks?: SubTask[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];
}
