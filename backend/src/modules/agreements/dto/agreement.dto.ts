import { IsInt, IsEnum, IsString, IsDateString, IsOptional, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';
import { TipoConvenio, EstadoConvenio } from '../entities/agreement.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateAgreementDto {
  @IsInt()
  @Transform(({ value }) => {
    // Convertir string a número (para FormData)
    if (typeof value === 'string') return parseInt(value, 10);
    return value;
  })
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

  // Campo interno para manejar archivo (no se valida, se usa en el servicio)
  documentoFile?: any;
}

export class UpdateAgreementDto extends PartialType(CreateAgreementDto) {}