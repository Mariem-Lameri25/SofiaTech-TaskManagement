import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { User } from 'src/users/user.entity';
import { GetNotificationsDto } from './dto/get-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateNotificationDto) {
    const user = await this.userRepo.findOne({ where: { id_user: +dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const notification = this.notificationRepo.create({
      contenu: dto.contenu,
      isRead: false,
      user,
    });

    return this.notificationRepo.save(notification);
  }

  async findAll() {
    return this.notificationRepo.find({ relations: ['user'] });
  }

  async findByUser(userId: number) {
    const user = await this.userRepo.findOne({ where: { id_user: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.notificationRepo.find({
      where: { user: { id_user: userId } },
      order: { dateCreation: 'DESC' },
    });
  }

  async markAsRead(id: number) {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');

    notification.isRead = true;
    return this.notificationRepo.save(notification);
  }

  async update(id: number, dto: UpdateNotificationDto) {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');

    Object.assign(notification, dto);
    return this.notificationRepo.save(notification);
  }

  async remove(id: number) {
    const result = await this.notificationRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Notification not found');
    }
    return { message: 'Notification deleted successfully' };
  }

  async createNotification(contenu: string, user: User) {
    const notification = this.notificationRepo.create({ contenu, user });
    return this.notificationRepo.save(notification);
  }

  async notifyMany(contenu: string, users: User[]) {
    const notifications = users.map(user => this.notificationRepo.create({ contenu, user }));
    return this.notificationRepo.save(notifications);
  }


async getUserNotifications(userId: number, query: GetNotificationsDto) {
  const { isRead, page = 1, limit = 10 } = query;

  console.log('[Service] getUserNotifications →', { userId, isRead, page, limit });

  const qb = this.notificationRepo.createQueryBuilder('notification')
    .leftJoinAndSelect('notification.user', 'user')
    .where('user.id_user = :userId', { userId });

  if (isRead !== undefined) {
    qb.andWhere('notification.isRead = :isRead', { isRead });
  }

  qb.orderBy('notification.dateCreation', 'DESC')
    .skip((page - 1) * limit)
    .take(limit)
    .select([
      'notification.id',
      'notification.contenu',
      'notification.isRead',
      'notification.dateCreation',
      'user.id_user',
      'user.email',
      'user.firstname',
      'user.lastname',
      'user.phoneNumber',
      'user.avatar',
      'user.role',
    ]);

  const [data, total] = await qb.getManyAndCount();
  const lastPage = Math.ceil(total / limit);

  console.log('[Service] Résultat →', { total, page, lastPage });

  return { data, total, page, lastPage };
}




}
