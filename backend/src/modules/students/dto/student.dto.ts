import { IsInt, IsString, IsOptional, IsUrl, Min, Max, Length, IsNumber, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateStudentDto {
  @IsInt({ message: 'El ID de usuario debe ser un número entero' })
  @Min(1, { message: 'Debe seleccionar un usuario válido' })
  usuarioId: number;

  @IsInt({ message: 'El ID de carrera debe ser un número entero' })
  @Min(1, { message: 'Debe seleccionar una carrera válida' })
  carreraId: number;

  @IsString({ message: 'El código universitario debe ser texto' })
  @Length(8, 20, { message: 'El código universitario debe tener entre 8 y 20 caracteres' })
  @Matches(/^[a-zA-Z0-9]+$/, { message: 'El código universitario solo puede contener letras y números' })
  codigoUniversitario: string;

  @IsInt({ message: 'El año de ingreso debe ser un número entero' })
  @Min(1900, { message: 'El año de ingreso debe ser mayor o igual a 1900' })
  @Max(new Date().getFullYear() + 1, { message: `El año de ingreso no puede ser mayor a ${new Date().getFullYear() + 1}` })
  @Type(() => Number)
  anioIngreso: number;

  @IsString({ message: 'La escuela profesional debe ser texto' })
  @Length(3, 200, { message: 'La escuela profesional debe tener entre 3 y 200 caracteres' })
  escuelaProfesional: string;

  @IsOptional()
  @IsUrl({}, { message: 'La URL del expediente académico no es válida' })
  expedienteAcademicoUrl?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El promedio general debe ser un número' })
  @Type(() => Number)
  @Min(0, { message: 'El promedio general no puede ser menor a 0' })
  @Max(20, { message: 'El promedio general no puede ser mayor a 20' })
  promedioGeneral?: number;

  @IsOptional()
  @IsInt({ message: 'Los créditos aprobados deben ser un número entero' })
  @Min(0, { message: 'Los créditos aprobados no pueden ser negativos' })
  @Type(() => Number)
  creditosAprobados?: number;
}

export class UpdateStudentDto extends PartialType(CreateStudentDto) {}