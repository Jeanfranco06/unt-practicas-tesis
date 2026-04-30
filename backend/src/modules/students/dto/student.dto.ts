import { IsInt, IsString, IsOptional, IsUrl, Min, Max, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateStudentDto {
  @IsInt()
  usuarioId: number;

  @IsString()
  @Length(8, 20)
  codigoUniversitario: string;

  @IsInt()
  @Min(1900)
  anioIngreso: number;

  @IsString()
  escuelaProfesional: string;

  @IsUrl()
  @IsOptional()
  expedienteAcademicoUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(20)
  promedioGeneral?: number;

  @IsInt()
  @Min(0)
  creditosAprobados?: number;
}

export class UpdateStudentDto extends PartialType(CreateStudentDto) {}