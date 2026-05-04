import { IsEmail, IsString, IsOptional, IsBoolean, IsInt, Min, MaxLength, MinLength, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// DTO base para datos de usuario
// NOTA: El campo 'email' se genera automáticamente según el tipo de usuario
// El campo 'emailRecuperacion' es obligatorio y es el correo personal del usuario
export class BaseUserDto {
  @IsEmail({}, { message: 'El email de recuperación debe ser un correo válido' })
  emailRecuperacion: string;

  @IsString()
  @MinLength(2)
  nombre: string;

  @IsString()
  @MinLength(2)
  apellidoPaterno: string;

  @IsString()
  @MinLength(2)
  apellidoMaterno: string;

  @IsString()
  @MinLength(6)
  contrasena: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;
}

// DTO para crear estudiante
export class CreateStudentDto extends BaseUserDto {
  @IsInt()
  @Min(1)
  carreraId: number;

  @IsInt()
  @Min(1990)
  anioIngreso: number;
}

// DTO para crear docente
export class CreateTeacherDto extends BaseUserDto {
  @IsInt({ message: 'La carrera debe ser un número entero' })
  @Min(1, { message: 'Debe seleccionar una carrera válida' })
  carreraId: number;

  @IsOptional()
  @IsString({ message: 'La especialidad debe ser texto' })
  @MaxLength(200, { message: 'La especialidad no puede tener más de 200 caracteres' })
  especialidad?: string;

  @IsOptional()
  @IsString({ message: 'La categoría debe ser texto' })
  @MaxLength(100, { message: 'La categoría no puede tener más de 100 caracteres' })
  categoria?: string;

  @IsOptional()
  @IsString({ message: 'La dedicación debe ser texto' })
  @MaxLength(50, { message: 'La dedicación no puede tener más de 50 caracteres' })
  dedicacion?: string;

  @IsOptional()
  @IsString({ message: 'La oficina debe ser texto' })
  @MaxLength(50, { message: 'La oficina no puede tener más de 50 caracteres' })
  oficina?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  @MaxLength(20, { message: 'El teléfono no puede tener más de 20 caracteres' })
  @Matches(/^[\d\s\-\+\(\)]*$/, { message: 'El teléfono solo puede contener números, espacios, guiones, paréntesis y el signo +' })
  telefono?: string;

  @ValidateNested({ message: 'Debe especificar los roles del docente de forma válida' })
  @Type(() => TeacherRolesDto)
  roles: TeacherRolesDto;
}

// DTO para los roles del docente
class TeacherRolesDto {
  @IsBoolean({ message: 'El rol asesor debe ser booleano' })
  asesor: boolean;

  @IsBoolean({ message: 'El rol coordinador debe ser booleano' })
  coordinador: boolean;
}

// DTO para crear representante de empresa
export class CreateRepresentativeDto extends BaseUserDto {
  @IsInt()
  @Min(1)
  empresaId: number;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  cargo: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  departamento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefonoDirecto?: string;

  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean = false;
}

// DTO para crear administrador
export class CreateAdminDto extends BaseUserDto {
  // Los administradores solo necesitan los datos base
  // No requieren perfil adicional
}
