import { IsInt, IsEnum, IsOptional } from 'class-validator';
import { AsignacionTipo, RolJurado } from '../entities/thesis-assignment.entity';

export class CreateThesisAssignmentDto {
  @IsInt()
  proyectoId: number;

  @IsInt()
  docenteId: number;

  @IsEnum(AsignacionTipo)
  tipo: AsignacionTipo;

  @IsEnum(RolJurado)
  @IsOptional()
  rolEspecifico?: RolJurado;
}