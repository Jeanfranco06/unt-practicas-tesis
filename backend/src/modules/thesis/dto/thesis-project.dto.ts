import { IsInt, IsString, Length, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ThesisEstado } from '../entities/thesis-project.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateThesisProjectDto {
  @IsInt()
  estudianteId: number;

  @IsString()
  @Length(5, 200)
  titulo: string;

  @IsString()
  resumen: string;

  @IsString()
  areaConocimiento: string;

  @IsEnum(ThesisEstado)
  @IsOptional()
  estado?: ThesisEstado;
}

export class UpdateThesisProjectDto extends PartialType(CreateThesisProjectDto) {
  @IsDateString()
  @IsOptional()
  fechaAprobacion?: string;
}