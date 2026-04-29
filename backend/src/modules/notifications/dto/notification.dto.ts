import { IsInt, IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { NotificacionTipo } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsInt()
  usuarioId: number;

  @IsString()
  titulo: string;

  @IsString()
  mensaje: string;

  @IsEnum(NotificacionTipo)
  @IsOptional()
  tipo?: NotificacionTipo;
}

export class MarkAsReadDto {
  @IsBoolean()
  leido: boolean;
}