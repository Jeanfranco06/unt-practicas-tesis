import { IsString, IsOptional, IsBoolean, Length, IsEmail } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCompanyDto {
  @IsString()
  @Length(11, 11)
  ruc: string;

  @IsString()
  @Length(3, 200)
  razonSocial: string;

  @IsString()
  @IsOptional()
  nombreComercial?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsEmail()
  @IsOptional()
  emailContacto?: string;

  @IsString()
  @IsOptional()
  representanteNombre?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}