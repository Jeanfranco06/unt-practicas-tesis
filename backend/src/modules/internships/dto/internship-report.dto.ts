import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { ReporteTipo } from '../entities/internship-report.entity';

export class CreateInternshipReportDto {
  @IsNumber()
  practicaId: number;

  @IsEnum(ReporteTipo)
  tipo: ReporteTipo;

  @IsString()
  contenido: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class UpdateInternshipReportDto {
  @IsOptional()
  @IsString()
  contenido?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}