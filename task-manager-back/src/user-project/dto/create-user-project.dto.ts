import { IsEnum, IsInt, IsString } from 'class-validator';
import { ProjectUserRole } from '../project-user-role.enum';

export class CreateUserProjectDto {
  @IsString()
  projectId: number;

  @IsInt()
  userId: number;

  @IsEnum(ProjectUserRole)
  roleProjet: ProjectUserRole;
}
