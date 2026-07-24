import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from './project.entity';
import { User } from 'src/users/user.entity';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjetUtilisateur } from 'src/user-project/user-project.entity';
import { NotificationsService } from 'src/notification/notification.service';
import { Notification } from 'src/notification/notification.entity';
import { CronService } from './cron.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, User, ProjetUtilisateur,Notification])],
  controllers: [ProjectsController],
  providers: [ProjectsService,NotificationsService,CronService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
