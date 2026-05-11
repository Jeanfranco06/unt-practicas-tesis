import { IsInt, IsNumber, IsOptional, IsString, IsEnum, IsDateString, IsJSON, Min, Max, Length } from 'class-validator';
import { PaymentStatus, PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsInt()
  estudianteId: number;

  @IsInt()
  conceptoId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  monto: number;

  @IsEnum(PaymentStatus)
  @IsOptional()
  estado?: PaymentStatus;

  @IsEnum(PaymentMethod)
  @IsOptional()
  metodoPago?: PaymentMethod;

  @IsString()
  @IsOptional()
  @Length(0, 100)
  referenciaPago?: string;

  @IsDateString()
  @IsOptional()
  fechaPago?: string;

  @IsDateString()
  @IsOptional()
  fechaVencimiento?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsInt()
  @IsOptional()
  registradoPor?: number;

  @IsString()
  @IsOptional()
  comprobanteUrl?: string;
}
