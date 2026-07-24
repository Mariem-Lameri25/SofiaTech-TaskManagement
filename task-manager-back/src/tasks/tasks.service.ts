import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from 'src/users/user.entity';
import { Project } from 'src/projects/project.entity';
import { NotificationsService } from 'src/notification/notification.service';
import { Notification } from 'src/notification/notification.entity';
import { GetTasksDto } from './dto/get-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,

    @InjectRepository(Project)
    private projectRepo: Repository<Project>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateTaskDto, createdById: number) {
  const {
    nom,
    description,
    status,
    dateCreation,
    dateDebut,
    dateFin,
    priorite,
    location,
    labels,
    projectId,
    assignedToId,
  } = dto;

  const project = await this.projectRepo.findOne({
    where: { id_projet: projectId },
    select: ['id_projet', 'nom'], // Charger le nom pour notif
  });

  if (!project) {
    throw new NotFoundException('Project not found');
  }

  const createdBy = await this.userRepo.findOneBy({ id_user: createdById });
  if (!createdBy) {
    throw new NotFoundException('Creator user not found');
  }

  const assignedTo = await this.userRepo.findOneBy({ id_user: assignedToId });
  if (!assignedTo) {
    throw new NotFoundException('Assigned user not found');
  }

  const task = this.taskRepo.create({
    nom,
    description,
    status,
    dateCreation,
    dateDebut,
    dateFin,
    priorite,
    location,
    labels,
    project,
    createdBy,
    assignedTo,
  });

  const savedTask = await this.taskRepo.save(task);

  // Notifier l'utilisateur assigné
  if (assignedTo) {
    await this.notificationsService.createNotification(
      `Une nouvelle tâche "${savedTask.nom}" vous a été assignée dans le projet "${project.nom}".`,
      assignedTo
    );
  }

  return savedTask;
}


  async findAllPaginated(query: GetTasksDto) {
  const { page = 1, limit = 10, search, status, priorite } = query;

  const qb = this.taskRepo
    .createQueryBuilder('task')
    .leftJoinAndSelect('task.project', 'project')
    .leftJoinAndSelect('task.createdBy', 'createdBy')
    .leftJoinAndSelect('task.assignedTo', 'assignedTo')
    .leftJoinAndSelect('task.subtasks', 'subtasks')
    .leftJoinAndSelect('task.attachments', 'attachments')
    .leftJoinAndSelect('task.comments', 'comments');

  if (search) {
    qb.andWhere(
      `(task.nom LIKE :search 
        OR task.description LIKE :search 
        OR project.nom LIKE :search 
        OR createdBy.firstname LIKE :search 
        OR createdBy.lastname LIKE :search 
        OR assignedTo.firstname LIKE :search 
        OR assignedTo.lastname LIKE :search)`,
      { search: `%${search}%` }
    );
  }

  if (status) {
    qb.andWhere('task.status = :status', { status });
  }

  if (priorite) {
    qb.andWhere('task.priorite = :priorite', { priorite });
  }

  qb.skip((page - 1) * limit)
    .take(limit)
    .orderBy('task.id_tache', 'DESC');

  const [data, total] = await qb.getManyAndCount();

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}


  async findOne(id: number) { // Changed parameter type from string to number
    const task = await this.taskRepo.findOne({
      where: { id_tache: id }, // Now id is a number, matching the entity
      relations: ['project', 'createdBy', 'assignedTo', 'subtasks', 'attachments', 'comments'],
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: number, dto: UpdateTaskDto) { // Changed parameter type from string to number
    const task = await this.taskRepo.findOne({
      where: { id_tache: id }, // Now id is a number, matching the entity
      relations: ['project', 'createdBy', 'assignedTo'],
    });
    if (!task) throw new NotFoundException('Task not found');

    // Apply simple fields
    Object.assign(task, dto);

    // Handle relational fields
    if (dto.projectId) {
      const project = await this.projectRepo.findOneBy({ id_projet: dto.projectId });
      if (!project) throw new NotFoundException('Project not found');
      task.project = project;
    }

    if (dto.createdById) {
      const createdBy = await this.userRepo.findOneBy({ id_user: dto.createdById });
      if (!createdBy) throw new NotFoundException('Creator user not found');
      task.createdBy = createdBy;
    }

    if (dto.assignedToId) {
      const assignedTo = await this.userRepo.findOneBy({ id_user: dto.assignedToId });
      if (!assignedTo) throw new NotFoundException('Assigned user not found');
      task.assignedTo = assignedTo;
    }

    return this.taskRepo.save(task);
  }

  async remove(id: number) { // Changed parameter type from string to number
    const result = await this.taskRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Task not found');
    }
    return { message: 'Task deleted successfully' };
  }

 findByProjectId(projectId: number) {
  return this.taskRepo.find({
    where: { project: { id_projet: projectId } },
    relations: ['project', 'assignedTo']
  });
}
async updateStatus(id: number, updates: Partial<UpdateTaskDto>) {
  const task = await this.taskRepo.findOne({ where: { id_tache: id } });
  if (!task) throw new NotFoundException('Task not found');

  Object.assign(task, updates); // Ici on applique les changements
  return await this.taskRepo.save(task); // On sauvegarde en BDD
}


}