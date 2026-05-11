import { IsOptional, IsEnum, IsInt, IsString, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaymentStatus, PaymentMethod } from '../entities/payment.entity';

export class PaymentFiltersDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  estado?: PaymentStatus;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  estudianteId?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  conceptoId?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  metodoPago?: PaymentMethod;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @IsOptional()
  @IsString()
  busqueda?: string;
}
