import { IsInt, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { AsignacionTipo, RolJurado } from '../entities/thesis-assignment.entity';

export class CreateThesisAssignmentDto {
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  proyectoId: number;

  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  docenteId: number;

  @IsEnum(AsignacionTipo)
  tipo: AsignacionTipo;

  @IsEnum(RolJurado)
  @IsOptional()
  rolEspecifico?: RolJurado;
}