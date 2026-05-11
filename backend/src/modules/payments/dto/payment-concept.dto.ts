import { IsInt, IsNumber, IsOptional, IsString, IsEnum, IsBoolean, Min, Length } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { PaymentType } from '../entities/payment-concept.entity';

export class CreatePaymentConceptDto {
  @IsString()
  @Length(1, 20)
  codigo: string;

  @IsString()
  @Length(1, 200)
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsEnum(PaymentType)
  tipo: PaymentType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monto: number;

  @IsInt()
  @IsOptional()
  carreraId?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsBoolean()
  @IsOptional()
  requiereAprobacion?: boolean;
}

export class UpdatePaymentConceptDto extends PartialType(CreatePaymentConceptDto) {}
