import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe, Patch, UseGuards,Request, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetTasksDto } from './dto/get-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly service: TasksService) {}

 @Post()
@UseGuards(JwtAuthGuard)
create(@Body() dto: CreateTaskDto, @Request() req) {
  const userId = req.user.id_user || req.user.sub || req.user.id;
  return this.service.create(dto, userId);
}

  @Get()
  findAll(@Query() query: GetTasksDto) {
  return this.service.findAllPaginated(query);
}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Get('project/:id')
getTasksByProject(@Param('id', ParseIntPipe) id: number) {
  return this.service.findByProjectId(id);
}

@Patch(':id')
updateStatus(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<UpdateTaskDto>) {
  return this.service.updateStatus(id, body);
}

}
