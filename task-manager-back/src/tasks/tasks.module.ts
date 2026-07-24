import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { Project } from 'src/projects/project.entity';
import { User } from 'src/users/user.entity';
import { NotificationsService } from 'src/notification/notification.service';
import { Notification } from 'src/notification/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Project, User,Notification])],
  controllers: [TasksController],
  providers: [TasksService,NotificationsService],
  exports: [TasksService],
})
export class TasksModule {}