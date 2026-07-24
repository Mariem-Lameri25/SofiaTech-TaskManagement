import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubTask } from './subtask.entity';

import { Task } from 'src/tasks/task.entity';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Injectable()
export class SubtasksService {
  constructor(
    @InjectRepository(SubTask)
    private readonly subtaskRepo: Repository<SubTask>,

    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  async create(dto: CreateSubtaskDto) {
    // Convert taskId to number if it's a string
    const taskId = typeof dto.taskId === 'string' ? parseInt(dto.taskId, 10) : dto.taskId;
    
    const task = await this.taskRepo.findOne({ where: { id_tache: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    const subtask = this.subtaskRepo.create({ ...dto, task });
    return this.subtaskRepo.save(subtask);
  }

  async findAll() {
    return this.subtaskRepo.find({ relations: ['task'] });
  }

  async findOne(id: number) {
    const subtask = await this.subtaskRepo.findOne({
      where: { id_subtask: id },
      relations: ['task'],
    });
    if (!subtask) throw new NotFoundException('Subtask not found');
    return subtask;
  }

  async update(id: number, dto: UpdateSubtaskDto) {
    const subtask = await this.subtaskRepo.findOne({
      where: { id_subtask: id },
      relations: ['task'],
    });
    if (!subtask) throw new NotFoundException('Subtask not found');

    Object.assign(subtask, dto);

    if (dto.taskId) {
      // Convert taskId to number if it's a string
      const taskId = typeof dto.taskId === 'string' ? parseInt(dto.taskId, 10) : dto.taskId;
      
      const task = await this.taskRepo.findOne({ where: { id_tache: taskId } });
      if (!task) throw new NotFoundException('Task not found');
      subtask.task = task;
    }

    return this.subtaskRepo.save(subtask);
  }

  async remove(id: number) {
    const result = await this.subtaskRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Subtask not found');
    }
    return { message: 'Subtask deleted successfully' };
  }
}