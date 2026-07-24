import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto, ProjectUserDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from 'src/users/user.entity';
import { ProjetUtilisateur } from 'src/user-project/user-project.entity';
import { ProjectUserRole } from 'src/user-project/project-user-role.enum';
import { NotificationsService } from 'src/notification/notification.service';
import { Notification } from 'src/notification/notification.entity';

@Injectable()
export class ProjectsService {
   private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(ProjetUtilisateur)
    private userProjectRepo: Repository<ProjetUtilisateur>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    
     private notificationsService: NotificationsService, 
  ) {}

 async create(dto: CreateProjectDto): Promise<Project> {
  const { managerId, projectUsers, ...rest } = dto;

  const project = this.projectRepo.create(rest);

  const manager = await this.userRepo.findOne({
    where: { id_user: +managerId },
  });

  if (!manager) {
    throw new NotFoundException('Manager not found');
  }

  project.manager = manager;
  const savedProject = await this.projectRepo.save(project);

  // ✅ Notifier le manager
  await this.notificationsService.createNotification(
    `Vous êtes désigné comme manager du projet "${savedProject.nom}".`,
    manager
  );

  // ✅ Ajouter les membres du projet et leur notifier
  if (projectUsers && projectUsers.length > 0) {
    for (const user of projectUsers) {
      const foundUser = await this.userRepo.findOne({
        where: { id_user: +user.userId },
      });

      if (!foundUser) continue;

      const member = this.userProjectRepo.create({
        utilisateur: foundUser,
        projet: savedProject,
        roleProjet: user.roleProjet as ProjectUserRole,
      });

      await this.userProjectRepo.save(member);

      // ✅ Notifier l'utilisateur membre du projet
      await this.notificationsService.createNotification(
        `Vous avez été ajouté au projet "${savedProject.nom}" en tant que "${user.roleProjet}".`,
        foundUser
      );
    }
  }

  return savedProject;
}


  async findAll(): Promise<Project[]> {
    return this.projectRepo.find({
      relations: ['manager', 'tasks', 'projectUsers', 'projectUsers.utilisateur'],
    });
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id_projet: id },
      relations: ['manager', 'tasks', 'projectUsers', 'projectUsers.utilisateur'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: number, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id_projet: id },
      relations: ['projectUsers'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    Object.assign(project, dto);

    if (dto.managerId) {
      const manager = await this.userRepo.findOne({
        where: { id_user: +dto.managerId },
      });

      if (!manager) {
        throw new NotFoundException('Manager not found');
      }

      project.manager = manager;
    }

    if (dto.projectUsers) {
      await this.userProjectRepo.delete({ projet: { id_projet: id } });

      const newMembers: ProjetUtilisateur[] = [];

      for (const user of dto.projectUsers) {
        const foundUser = await this.userRepo.findOne({
          where: { id_user: +user.userId },
        });

        if (!foundUser) continue;

        const member = this.userProjectRepo.create({
          utilisateur: foundUser,
          projet: project,
          roleProjet: user.roleProjet as ProjectUserRole,
        });

        const savedMember = await this.userProjectRepo.save(member);
        newMembers.push(savedMember);
      }

      project.projectUsers = newMembers;
    }

    return this.projectRepo.save(project);
  }

  async remove(id: number): Promise<{ message: string }> {
    const project = await this.projectRepo.findOne({
      where: { id_projet: id },
      relations: ['projectUsers'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.userProjectRepo.delete({ projet: { id_projet: id } });

    await this.projectRepo.delete(id);

    return { message: 'Project deleted successfully' };
  }

  async getUsersByProjectId(id: number): Promise<ProjetUtilisateur[]> {
    const project = await this.projectRepo.findOne({
      where: { id_projet: id }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.userProjectRepo.find({
      where: { projet: { id_projet: id } },
      relations: ['utilisateur'],
    });
  }

  /**
   * ⏰ Notifier les projets approchant de leur date de fin
   */
async notifyProjectsApproachingDeadline(): Promise<void> {
  const now = new Date();
  const threeDaysLater = new Date();
  threeDaysLater.setDate(now.getDate() + 3);

  const projects = await this.projectRepo.find({
    where: {
      dateFin: Between(now, threeDaysLater),
    },
    relations: ['manager', 'projectUsers', 'projectUsers.utilisateur'],
  });

  if (projects.length === 0) {
    this.logger.log('Aucun projet n’approche de sa date de fin dans les 3 jours.');
    return;
  }

  for (const project of projects) {
    const dateFin = new Date(project.dateFin); // ✅ Sécurité : conversion explicite

    const usersToNotify = [
      ...(project.manager ? [project.manager] : []),
      ...project.projectUsers.map((pu) => pu.utilisateur),
    ];

    for (const user of usersToNotify) {
      const message = `Le projet "${project.nom}" approche de sa date de fin prévue (${dateFin.toLocaleDateString()}).`;

      await this.notificationsService.createNotification(message, user);

      this.logger.log(
        `✅ Notification envoyée à ${user.firstname ?? ''} ${user.lastname ?? ''} pour le projet "${project.nom}".`,
      );
    }

    this.logger.log(
      `🔔 Notifications terminées pour le projet "${project.nom}" (fin prévue le ${dateFin.toLocaleDateString()}).`,
    );
  }
}

async getProjectsByUser(userId: number): Promise<Project[]> {
  return this.projectRepo
    .createQueryBuilder('project')
    .leftJoinAndSelect('project.manager', 'manager')
    .leftJoinAndSelect('project.tasks', 'tasks')
    .leftJoinAndSelect('project.projectUsers', 'projectUsers')
    .leftJoinAndSelect('projectUsers.utilisateur', 'utilisateur')
    .where('manager.id_user = :userId', { userId })
    .orWhere('utilisateur.id_user = :userId', { userId })
    .getMany();
}


}
