import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from 'src/users/user.entity';
import { Task } from 'src/tasks/task.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  async create(dto: CreateCommentDto) {
    // Convert userId to number if it's a string
    const userId = typeof dto.userId === 'string' ? parseInt(dto.userId, 10) : dto.userId;
    const user = await this.userRepo.findOne({ where: { id_user: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Convert taskId to number if it's a string
    const taskId = typeof dto.taskId === 'string' ? parseInt(dto.taskId, 10) : dto.taskId;
    const task = await this.taskRepo.findOne({ where: { id_tache: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    const comment = this.commentRepo.create({
      contenu: dto.contenu,
      dateCreation: new Date(),
      user,
      task,
    });

    return this.commentRepo.save(comment);
  }

  async findAll() {
    return this.commentRepo.find({ relations: ['user', 'task'] });
  }

  async findOne(id: number) {
    const comment = await this.commentRepo.findOne({
      where: { id_commentaire: id },
      relations: ['user', 'task'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async update(id: number, dto: UpdateCommentDto) {
    const comment = await this.commentRepo.findOne({ where: { id_commentaire: id } });
    if (!comment) throw new NotFoundException('Comment not found');

    // Handle relational updates if needed
    if (dto.userId) {
      const userId = typeof dto.userId === 'string' ? parseInt(dto.userId, 10) : dto.userId;
      const user = await this.userRepo.findOne({ where: { id_user: userId } });
      if (!user) throw new NotFoundException('User not found');
      comment.user = user;
    }

    if (dto.taskId) {
      const taskId = typeof dto.taskId === 'string' ? parseInt(dto.taskId, 10) : dto.taskId;
      const task = await this.taskRepo.findOne({ where: { id_tache: taskId } });
      if (!task) throw new NotFoundException('Task not found');
      comment.task = task;
    }

    // Apply other updates
    Object.assign(comment, { contenu: dto.contenu });
    return this.commentRepo.save(comment);
  }

  async remove(id: number) {
    const result = await this.commentRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Comment not found');
    }
    return { message: 'Comment deleted successfully' };
  }
}