import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjetUtilisateur } from './user-project.entity';
import { CreateUserProjectDto } from './dto/create-user-project.dto';
import { UpdateUserProjectDto } from './dto/update-user-project.dto';
import { Project } from 'src/projects/project.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class UserProjectService {
  constructor(
    @InjectRepository(ProjetUtilisateur)
    private readonly userProjectRepository: Repository<ProjetUtilisateur>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserProjectDto): Promise<ProjetUtilisateur> {
    const project = await this.projectRepository.findOne({ where: { id_projet: dto.projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const user = await this.userRepository.findOne({ where: { id_user: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const userProject = this.userProjectRepository.create({
      projet: project,
      utilisateur: user,
      roleProjet: dto.roleProjet,
    });

    return this.userProjectRepository.save(userProject);
  }

  findAll(): Promise<ProjetUtilisateur[]> {
    return this.userProjectRepository.find({ relations: ['projet', 'utilisateur'] });
  }

  async findOne(id: number): Promise<ProjetUtilisateur> {
    const record = await this.userProjectRepository.findOne({
      where: { id },
      relations: ['projet', 'utilisateur'],
    });
    if (!record) throw new NotFoundException('UserProject not found');
    return record;
  }

  async update(id: number, dto: UpdateUserProjectDto): Promise<ProjetUtilisateur> {
    const userProject = await this.findOne(id);

    if (dto.projectId) {
      const project = await this.projectRepository.findOne({ where: { id_projet: dto.projectId } });
      if (!project) throw new NotFoundException('Project not found');
      userProject.projet = project;
    }

    if (dto.userId) {
      const user = await this.userRepository.findOne({ where: { id_user: dto.userId } });
      if (!user) throw new NotFoundException('User not found');
      userProject.utilisateur = user;
    }

    if (dto.roleProjet) {
      userProject.roleProjet = dto.roleProjet;
    }

    return this.userProjectRepository.save(userProject);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userProjectRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('UserProject not found');
  }
}
