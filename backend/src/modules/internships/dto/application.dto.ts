import { IsInt, IsOptional, IsString, IsUrl, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApplicationEstado } from '../entities/internship-application.entity';

export class CreateApplicationDto {
  @IsInt()
  @Transform(({ value }: { value: any }) => parseInt(value, 10))
  ofertaId: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }: { value: any }) => value ? parseInt(value, 10) : undefined)
  estudianteId?: number;

  @IsUrl()
  @IsOptional()
  documentoCvUrl?: string;

  @IsString()
  @IsOptional()
  cartaPresentacion?: string;

  // For file upload - will be processed in service
  cvFile?: Express.Multer.File;
}

export class ReviewApplicationDto {
  @IsEnum(ApplicationEstado)
  estado: ApplicationEstado;
}