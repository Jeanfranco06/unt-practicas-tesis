import { IsString, IsInt, IsDateString, IsOptional, IsEnum, Min, Max, Length } from 'class-validator';
import { OfertaEstado } from '../entities/internship-offer.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateInternshipOfferDto {
  @IsInt()
  empresaId: number;

  @IsInt()
  @IsOptional()
  convenioId?: number;

  @IsString()
  @Length(3, 200)
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  requisitos: string;

  @IsDateString()
  fechaInicioPostulacion: string;

  @IsDateString()
  fechaFinPostulacion: string;

  @IsDateString()
  fechaInicioPractica: string;

  @IsDateString()
  fechaFinPractica: string;

  @IsInt()
  @Min(1)
  cupos: number;

  @IsInt()
  @Min(1)
  @Max(600)
  @IsOptional()
  horasTotalesRequeridas?: number;  // Horas configurables por oferta (default: 400)

  @IsEnum(OfertaEstado)
  @IsOptional()
  estado?: OfertaEstado;
}

export class UpdateInternshipOfferDto extends PartialType(CreateInternshipOfferDto) {}