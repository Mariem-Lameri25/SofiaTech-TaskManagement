import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './attachment.entity';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { Task } from 'src/tasks/task.entity';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentRepo: Repository<Attachment>,
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
  ) {}

  async create(dto: CreateAttachmentDto) {
    // Convert taskId to number if it's a string
    const taskId = typeof dto.taskId === 'string' ? parseInt(dto.taskId, 10) : dto.taskId;
    const task = await this.taskRepo.findOneBy({ id_tache: taskId });
    
    const attachment = this.attachmentRepo.create(dto);
    attachment.task = task;
    return this.attachmentRepo.save(attachment);
  }
  findAll() {
    return this.attachmentRepo.find({ relations: ['task'] });
  }

  findOne(id: string) {
    return this.attachmentRepo.findOne({ where: { id_piece: id }, relations: ['task'] });
  }

  async update(id: string, dto: UpdateAttachmentDto) {
    await this.attachmentRepo.update(id, dto);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.attachmentRepo.delete(id);
  }
}
