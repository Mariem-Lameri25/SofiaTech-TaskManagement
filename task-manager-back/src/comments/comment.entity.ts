import { Task } from 'src/tasks/task.entity';
import { User } from 'src/users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';


@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id_commentaire: number;

  @Column()
  contenu: string;

  @Column({ type: 'timestamp' })
  dateCreation: Date;

  @ManyToOne(() => User, (user) => user.createdComments)
  user: User;

  @ManyToOne(() => Task, (task) => task.comments)
  task: Task;
}
