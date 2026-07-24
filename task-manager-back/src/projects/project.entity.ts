import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { ProjectStatus } from './projectStatus';
import { Task } from 'src/tasks/task.entity';
import { ProjetUtilisateur } from 'src/user-project/user-project.entity';
@Entity()
export class Project {
  @PrimaryGeneratedColumn()
id_projet: number;

  @Column()
  nomClient: string;

  @Column()
  nom: string;

  @Column()
  description: string;

  @Column({ type: 'date' })
  dateDebut: Date;

  @Column({ type: 'date' })
  dateFin: Date;

  @CreateDateColumn({ type: 'timestamp' })
dateCreation: Date;

  @Column({ type: 'enum', enum: ProjectStatus })
  status: ProjectStatus;

  @Column()
  abreviation: string;

  @ManyToOne(() => User, (user) => user.managedProjects)
  manager: User;

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];

 @OneToMany(() => ProjetUtilisateur, (pu) => pu.projet, { cascade: true, onDelete: 'CASCADE', eager: true, })
projectUsers: ProjetUtilisateur[];


}  
