import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { RoleName } from '../entities/role.entity';

export class CreateRoleDto {
  @IsString()
  @MaxLength(50)
  nombre: RoleName;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nombre?: RoleName;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
