import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private notifRepo: Repository<Notification>) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notif = this.notifRepo.create(dto);
    return this.notifRepo.save(notif);
  }

  async findByUser(usuarioId: number, limit = 50): Promise<Notification[]> {
    return this.notifRepo.find({ where: { usuarioId }, order: { creadoEn: 'DESC' }, take: limit });
  }

  async markAsRead(id: number, leido: boolean): Promise<void> {
    await this.notifRepo.update(id, { leido });
  }

  async deleteOldNotifications(daysOld = 30): Promise<void> {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);
    await this.notifRepo.delete({ creadoEn: date });
  }
}