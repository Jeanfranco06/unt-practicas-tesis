import { IsInt, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateStudentInternshipDto {
  @IsString()
  nombreEmpresaExterna: string;

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
