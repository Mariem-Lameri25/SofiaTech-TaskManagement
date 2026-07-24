import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjetUtilisateur } from './user-project.entity';
import { Project } from 'src/projects/project.entity';
import { User } from 'src/users/user.entity';
import { UserProjectController } from './user-project.controller';
import { UserProjectService } from './user-project.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProjetUtilisateur, Project, User])],
  controllers: [UserProjectController],
  providers: [UserProjectService],
  exports: [UserProjectService],
})
export class UserProjectModule {}
