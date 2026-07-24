import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProjectsService } from 'src/projects/projects.service';

@Injectable()
export class CronService {
  constructor(private readonly projectsService: ProjectsService) {}

  // Runs every day at midnight (00:00)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleProjectDeadlineNotifications() {
    console.log('[CRON] Running deadline check for projects...');
    await this.projectsService.notifyProjectsApproachingDeadline();
  }
}
