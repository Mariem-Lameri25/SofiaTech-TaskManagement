import { ProjectUserRole } from './project-user-role.enum';
import { User } from './user.model';

export interface ProjectUser {
id: number;
utilisateur: User;
roleProjet: ProjectUserRole;
}