import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
  Req,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';

import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsService } from './notification.service';
import { GetNotificationsDto } from './dto/get-notification.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.service.create(dto);
  }

 // @Get()
 // findAll() {
  //  return this.service.findAll();
 // }

 // @Get('user/:userId')
  //findByUser(@Param('userId') userId: string) {
   // return this.service.findByUser(+userId);
 // }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationDto,
  ) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
@Get()
async getUserNotifications(
  @Request() req,
  @Query() query: GetNotificationsDto
) {
  console.log('[Controller] req.user →', req.user);

  // Utilise sub ou id selon ce que retourne ton JwtStrategy
  const userId = req.user?.sub || req.user?.id_user || req.user?.id;
  if (!userId) {
    throw new Error('Impossible de récupérer userId depuis le JWT');
  }

  // Conversion de isRead venant de la query string
  if (typeof query.isRead === 'string') {
    query.isRead = query.isRead === 'true';
  }

  console.log('[Controller] getUserNotifications →', { userId, query });
  return this.service.getUserNotifications(userId, query);
}


}
