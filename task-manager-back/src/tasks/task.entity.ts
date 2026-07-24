import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TaskStatus } from './taskStatus';
import { TaskPriority } from './taskPriority';
import { Project } from 'src/projects/project.entity';
import { User } from 'src/users/user.entity';
import { Comment } from 'src/comments/comment.entity';
import { SubTask } from 'src/subtasks/subtask.entity';
import { Attachment } from 'src/attachments/attachment.entity';

@Entity('task')
export class Task {
  @PrimaryGeneratedColumn()
  id_tache: number; // Should be number, not string

  @Column()
  nom: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.EN_ATTENTE,
  })
  status: TaskStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreation: Date;

  @Column({ type: 'date' })
  dateDebut: Date;

  @Column({ type: 'date' })
  dateFin: Date;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MOYENNE,
  })
  priorite: TaskPriority;

  @Column()
  location: string;

  @ManyToOne(() => Project, (project) => project.tasks, {
    onDelete: 'CASCADE', // ✅ suppression en cascade
  })
  project: Project;

  @ManyToOne(() => User, (user) => user.createdTasks)
  createdBy: User;

  @ManyToOne(() => User, (user) => user.assignedTasks)
  assignedTo: User;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];

  @OneToMany(() => Attachment, (attachment) => attachment.task)
  attachments: Attachment[];

  @OneToMany(() => SubTask, (subTask) => subTask.task, { nullable: true })
  subtasks: SubTask[];

  @Column('simple-array', { nullable: true })
  labels: string[];
}
