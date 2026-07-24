import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsEnum, IsString, IsDateString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { TaskStatus } from '../taskStatus';
import { TaskPriority } from '../taskPriority';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsDateString()
  dateDebut?: Date;

  @IsOptional()
  @IsDateString()
  dateFin?: Date;

  @IsOptional()
  @IsEnum(TaskPriority)
  priorite?: TaskPriority;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  projectId?: number;

  @IsOptional()
  @IsNumber()
  createdById?: number;

  @IsOptional()
  @IsNumber()
  assignedToId?: number;

  @IsOptional()
@IsArray()
@IsString({ each: true })
labels?: string[];
}