import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserRole } from './user-role.enum';
import { Project } from 'src/projects/project.entity';
import { Task } from 'src/tasks/task.entity';
import { Comment } from 'src/comments/comment.entity';
import { ProjetUtilisateur } from 'src/user-project/user-project.entity';
import { Notification } from 'src/notification/notification.entity';


@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id_user: number;

  @Column({ unique: true })
  email: string;

  @Column({ length: 50 })
  firstname: string;

  @Column({ length: 50 })
  lastname: string;

  @Column({ length: 20 })
  phoneNumber: string;

  @Column({ nullable: true })
  avatar: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER, // ✅ default role
  })
  role: UserRole;

   @OneToMany(() => Project, (project) => project.manager)
  managedProjects: Project[];

  @OneToMany(() => Task, (task) => task.createdBy)
  createdTasks: Task[];

  @OneToMany(() => Task, (task) => task.assignedTo)
  assignedTasks: Task[];

  @OneToMany(() => Comment, (comment) => comment.user)
  createdComments: Comment[];

@OneToMany(() => ProjetUtilisateur, pu => pu.utilisateur)
projectAssignments: ProjetUtilisateur[];

@OneToMany(() => Notification, (notification) => notification.user)
notifications: Notification[];


 // ---- reset password fields ----------------
  @Column({ nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordTokenExpires: Date | null;

  @Column({ default: false })
  resetPasswordTokenUsed: boolean;

}
