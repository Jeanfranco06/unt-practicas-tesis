import { IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateHoursTrackingDto {
  @IsNumber()
  practicaId: number;

  @IsDateString()
  fechaTrabajada: string;

  @IsNumber()
  horas: number;

  @IsOptional()
  descripcionActividad?: string;

  @IsOptional()
  evidenciaUrl?: string;
}

export class UpdateHoursTrackingDto {
  @IsOptional()
  @IsDateString()
  fechaTrabajada?: string;

  @IsOptional()
  @IsNumber()
  horas?: number;

  @IsOptional()
  descripcionActividad?: string;

  @IsOptional()
  evidenciaUrl?: string;
}