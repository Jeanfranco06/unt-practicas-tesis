import { IsInt, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { PracticaOrigen } from '../entities/internship.entity';

export class CreateInternshipDto {
  @IsEnum(PracticaOrigen)
  @IsOptional()
  origen?: PracticaOrigen;

  @IsInt()
  @IsOptional()
  estudianteId?: number;

  @IsInt()
  @IsOptional()
  empresaId?: number;

  @IsString()
  @IsOptional()
  nombreEmpresaExterna?: string;

  @IsString()
  asesorEmpresaNombre: string;

  @IsInt()
  horasTotalesRequeridas: number;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}

export class ReviewInternshipDto {
  @IsEnum(['aprobado', 'rechazado'])
  accion: 'aprobado' | 'rechazado';

  @IsString()
  @IsOptional()
  comentario?: string;
}
