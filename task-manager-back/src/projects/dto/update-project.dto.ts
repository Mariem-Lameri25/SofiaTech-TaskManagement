import {
IsEnum,
IsOptional,
IsString,
IsDateString,
IsArray,
ValidateNested,
IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus } from '../projectStatus';
import { ProjectUserRole } from 'src/user-project/project-user-role.enum';


export class UpdateProjectUserDto {
 @IsNumber()
@IsOptional()
userId?: number;

@IsEnum(ProjectUserRole)
@IsOptional()
roleProjet?: ProjectUserRole;
}

export class UpdateProjectDto {
@IsString()
@IsOptional()
nomClient?: string;

@IsString()
@IsOptional()
nom?: string;

@IsString()
@IsOptional()
description?: string;

@IsDateString()
@IsOptional()
dateDebut?: string;

@IsDateString()
@IsOptional()
dateFin?: string;

@IsDateString()
@IsOptional()
dateCreation?: string;

@IsEnum(ProjectStatus)
@IsOptional()
status?: ProjectStatus;

@IsString()
@IsOptional()
abreviation?: string;

@IsString()
@IsOptional()
managerId?: string;

@IsArray()
@ValidateNested({ each: true })
@Type(() => UpdateProjectUserDto)
@IsOptional()
projectUsers?: UpdateProjectUserDto[];
}