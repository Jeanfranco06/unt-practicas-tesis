import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto';
import { IsEnum, IsOptional, IsString, IsInt } from 'class-validator';
import { PaymentStatus } from '../entities/payment.entity';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus)
  estado: PaymentStatus;

  @IsInt()
  @IsOptional()
  aprobadoPor?: number;

  @IsString()
  @IsOptional()
  motivoRechazo?: string;
}

export class RejectPaymentDto {
  @IsString()
  motivo: string;
}
