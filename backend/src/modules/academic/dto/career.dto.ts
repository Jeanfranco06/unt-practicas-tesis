import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';

export class CreateCareerDto {
  @IsNumber()
  facultadId: number;

  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsString()
  @MaxLength(10)
  codigo: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateCareerDto {
  @IsNumber()
  @IsOptional()
  facultadId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  nombre?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  codigo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
