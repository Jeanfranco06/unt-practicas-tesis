import { IsEmail, IsString, IsEnum, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { RolUsuario } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail({}, { message: 'El email debe ser un correo válido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contrasena: string;

  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @IsString({ message: 'El apellido paterno debe ser texto' })
  @MinLength(2, { message: 'El apellido paterno debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El apellido paterno no puede exceder 100 caracteres' })
  apellidoPaterno: string;

  @IsString({ message: 'El apellido materno debe ser texto' })
  @MinLength(2, { message: 'El apellido materno debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El apellido materno no puede exceder 100 caracteres' })
  apellidoMaterno: string;

  @IsEnum(RolUsuario, { message: 'El rol debe ser válido' })
  rol: RolUsuario;

  @IsBoolean()
  @IsOptional()
  activo?: boolean = true;
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  apellidoPaterno?: string;

  @IsString()
  @IsOptional()
  apellidoMaterno?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}