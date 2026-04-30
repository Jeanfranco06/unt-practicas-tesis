import { IsInt, IsEnum, IsString, IsDateString, IsOptional, IsUrl } from 'class-validator';
import { TipoConvenio, EstadoConvenio } from '../entities/agreement.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateAgreementDto {
  @IsInt()
  empresaId: number;

  @IsEnum(TipoConvenio)
  tipo: TipoConvenio;

  @IsString()
  objetoContrato: string;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaVencimiento: string;

  @IsEnum(EstadoConvenio)
  @IsOptional()
  estado?: EstadoConvenio;

  @IsUrl()
  @IsOptional()
  documentoUrl?: string;
}

export class UpdateAgreementDto extends PartialType(CreateAgreementDto) {}