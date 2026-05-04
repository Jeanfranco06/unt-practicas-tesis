import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificacionTipo } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/notification.dto';

// Enum para prioridades de notificaciones
export enum NotificacionPrioridad {
  BAJA = 'low',
  MEDIA = 'medium',
  ALTA = 'high',
}

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private notifRepo: Repository<Notification>) {}

  private mapTipoToEnum(tipo?: string): NotificacionTipo {
    const tipoMap: Record<string, NotificacionTipo> = {
      'info': NotificacionTipo.INFO,
      'exito': NotificacionTipo.EXITO,
      'advertencia': NotificacionTipo.ADVERTENCIA,
      'error': NotificacionTipo.ERROR,
      'system_alert': NotificacionTipo.ADVERTENCIA,
      'application_approved': NotificacionTipo.EXITO,
      'application_rejected': NotificacionTipo.ERROR,
      'hours_approved': NotificacionTipo.EXITO,
      'hours_rejected': NotificacionTipo.ERROR,
      'practice_completed': NotificacionTipo.EXITO,
      'new_application': NotificacionTipo.INFO,
      'deadline_reminder': NotificacionTipo.ADVERTENCIA,
    };
    return tipo ? (tipoMap[tipo] || NotificacionTipo.INFO) : NotificacionTipo.INFO;
  }

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notif = this.notifRepo.create({
      ...dto,
      tipo: this.mapTipoToEnum(dto.tipo),
    });
    return this.notifRepo.save(notif);
  }

  async findByUser(usuarioId: number, limit = 50): Promise<Notification[]> {
    try {
      return await this.notifRepo.find({
        where: { usuarioId, archivada: false },
        order: { creadoEn: 'DESC' },
        take: limit,
      });
    } catch (error) {
      console.error('Error in findByUser:', error);
      throw error;
    }
  }

  async markAsRead(id: number, leido: boolean): Promise<void> {
    await this.notifRepo.update(id, { leido });
  }

  async deleteOldNotifications(daysOld = 30): Promise<void> {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);
    await this.notifRepo.delete({ creadoEn: date });
  }

  async archive(id: number): Promise<void> {
    await this.notifRepo.update(id, { archivada: true });
  }

  async unarchive(id: number): Promise<void> {
    await this.notifRepo.update(id, { archivada: false });
  }

  async markAsUnread(id: number): Promise<void> {
    await this.notifRepo.update(id, { leido: false });
  }

  async delete(id: number): Promise<void> {
    await this.notifRepo.delete(id);
  }

  async notifyUser(
    usuarioId: number,
    titulo: string,
    mensaje: string,
    tipo: string = 'info',
    prioridad: NotificacionPrioridad = NotificacionPrioridad.BAJA,
    datos?: any,
  ): Promise<Notification> {
    const notif = this.notifRepo.create({
      usuarioId,
      titulo,
      mensaje,
      tipo: this.mapTipoToEnum(tipo),
      prioridad,
      datos,
      leido: false,
      archivada: false,
    });
    return this.notifRepo.save(notif);
  }

  async notifyAdmins(
    adminIds: number[],
    titulo: string,
    mensaje: string,
    tipo: string = 'system_alert',
    prioridad: string = 'high',
    datos?: any,
  ): Promise<Notification[]> {
    const notifications = adminIds.map((usuarioId) =>
      this.notifRepo.create({
        usuarioId,
        titulo,
        mensaje,
        tipo: this.mapTipoToEnum(tipo),
        prioridad,
        datos,
        leido: false,
        archivada: false,
      }),
    );
    return this.notifRepo.save(notifications);
  }

  async getUnreadCount(usuarioId: number): Promise<number> {
    try {
      return await this.notifRepo.count({
        where: { usuarioId, leido: false, archivada: false },
      });
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      throw error;
    }
  }

  async findArchived(usuarioId: number, limit = 50): Promise<Notification[]> {
    return this.notifRepo.find({
      where: { usuarioId, archivada: true },
      order: { creadoEn: 'DESC' },
      take: limit,
    });
  }
}