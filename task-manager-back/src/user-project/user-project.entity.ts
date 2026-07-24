import { Project } from 'src/projects/project.entity';
import { User } from 'src/users/user.entity';
import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
} from 'typeorm';
import { ProjectUserRole } from './project-user-role.enum';

@Entity()
export class ProjetUtilisateur {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, (project) => project.projectUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projet_id' })
  projet: Project;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur: User;

  @Column({ name: 'role_projet', type: 'enum', enum: ProjectUserRole })
  roleProjet: ProjectUserRole;
}
