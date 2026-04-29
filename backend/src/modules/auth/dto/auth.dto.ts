import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { RolUsuario } from '../../users/entities/user.entity';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  contrasena: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  contrasena: string;

  @IsString()
  nombre: string;

  @IsString()
  apellidoPaterno: string;

  @IsString()
  apellidoMaterno: string;

  @IsEnum(RolUsuario)
  rol: RolUsuario;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}