import { IsString, IsOptional, IsNumber, MaxLength } from 'class-validator';

export class CreateTeacherDto {
  @IsNumber()
  usuarioId: number;

  @IsNumber()
  carreraId: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  especialidad?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  categoria?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  dedicacion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  oficina?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;
}

export class UpdateTeacherDto {
  @IsNumber()
  @IsOptional()
  usuarioId?: number;

  @IsNumber()
  @IsOptional()
  carreraId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  especialidad?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  categoria?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  dedicacion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  oficina?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;
}
