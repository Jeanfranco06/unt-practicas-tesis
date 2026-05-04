import { IsInt, IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreateNotificationDto {
  @IsInt()
  usuarioId: number;

  @IsString()
  titulo: string;

  @IsString()
  mensaje: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsOptional()
  prioridad?: string;

  @IsObject()
  @IsOptional()
  datos?: any;
}

export class MarkAsReadDto {
  @IsBoolean()
  leido: boolean;
}