import { IsString, IsOptional, IsBoolean, Length, IsEmail } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { IsRucValid } from '../../../common/validators/ruc.validator';

export class CreateCompanyDto {
  @IsString({ message: 'El RUC debe ser texto' })
  @Length(11, 11, { message: 'El RUC debe tener exactamente 11 dígitos' })
  @IsRucValid({ message: 'El RUC no es válido según el dígito verificador de SUNAT' })
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

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}