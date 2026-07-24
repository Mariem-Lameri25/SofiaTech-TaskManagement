import { Task } from 'src/tasks/task.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';

@Entity()
export class SubTask {
  @PrimaryGeneratedColumn()
  id_subtask: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ default: false })
  isCompleted: boolean;

  @ManyToOne(() => Task, (task) => task.subtasks)
  task: Task;
}
