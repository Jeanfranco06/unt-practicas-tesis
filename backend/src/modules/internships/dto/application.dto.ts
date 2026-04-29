import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApplicationEstado } from '../entities/internship-application.entity';

export class CreateApplicationDto {
  @IsInt()
  ofertaId: number;

  @IsInt()
  estudianteId: number;

  @IsUrl()
  @IsOptional()
  documentoCvUrl?: string;

  @IsString()
  @IsOptional()
  cartaPresentacion?: string;
}

export class ReviewApplicationDto {
  @IsEnum(ApplicationEstado)
  estado: ApplicationEstado;
}