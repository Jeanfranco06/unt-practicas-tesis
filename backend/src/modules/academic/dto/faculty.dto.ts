import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateFacultyDto {
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

export class UpdateFacultyDto {
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
