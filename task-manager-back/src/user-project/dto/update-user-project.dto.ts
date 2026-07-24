import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ProjectUserRole } from '../project-user-role.enum';

export class UpdateUserProjectDto {
  @IsOptional()
  @IsString()
  projectId?: number;

  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsEnum(ProjectUserRole)
  roleProjet?: ProjectUserRole;
}
