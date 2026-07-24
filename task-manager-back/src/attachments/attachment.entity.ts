import { Task } from 'src/tasks/task.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';


@Entity()
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id_piece: string;

  @Column()
  url: string;

  @Column()
  type: string;

  @CreateDateColumn()
  uploadedAt: Date;

  @ManyToOne(() => Task, (task) => task.attachments, { onDelete: 'CASCADE' })
  task: Task;
}
