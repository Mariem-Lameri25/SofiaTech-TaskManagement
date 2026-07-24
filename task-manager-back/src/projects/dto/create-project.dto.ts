import {
IsEnum,
IsNotEmpty,
IsString,
IsDateString,
IsArray,
ValidateNested,
IsOptional,
IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus } from '../projectStatus';
import { ProjectUserRole } from 'src/user-project/project-user-role.enum';

export class ProjectUserDto {
 @IsNumber()
@IsNotEmpty()
userId: number;

@IsEnum(ProjectUserRole)
roleProjet: ProjectUserRole;
}

export class CreateProjectDto {
@IsString()
@IsNotEmpty()
nomClient: string;

@IsString()
@IsNotEmpty()
nom: string;

@IsString()
@IsOptional()
description?: string;

@IsDateString()
dateDebut: string;

@IsDateString()
dateFin: string;

@IsEnum(ProjectStatus)
status: ProjectStatus;

@IsString()
@IsNotEmpty()
abreviation: string;

@IsString()
@IsNotEmpty()
managerId: string;

@IsArray()
@ValidateNested({ each: true })
@Type(() => ProjectUserDto)
@IsOptional()
projectUsers?: ProjectUserDto[];
}