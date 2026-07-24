import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe,Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/user-role.enum';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }
@Get('my-projects')
@Roles(UserRole.USER)
getUserProjects(@Request() req) {
  const userId = req.user.id;
  return this.service.getProjectsByUser(userId);
}

@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.service.findOne(id);
}

 

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Get(':id/users')
  getUsersForProject(@Param('id', ParseIntPipe) id: number) {
    return this.service.getUsersByProjectId(id);
  }
// Endpoint de test temporaire pour notifications deadline
  @Get('test-notify-deadline')
  async testNotifyDeadline() {
    await this.service.notifyProjectsApproachingDeadline();
    return { message: 'Notification check executed' };
  }
 
}
