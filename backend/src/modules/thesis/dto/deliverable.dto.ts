import { IsInt, IsString, IsDateString, IsOptional, IsUrl, Min } from 'class-validator';

export class CreateDeliverableDto {
  @IsInt()
  proyectoId: number;

  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  fechaLimite: string;

  @IsInt()
  @Min(1)
  orden: number;

  @IsUrl()
  @IsOptional()
  documentoReferenciaUrl?: string;
}

export class SubmitDeliverableDto {
  @IsInt()
  entregableId: number;

  @IsString()
  tituloEntrega: string;

  @IsUrl()
  documentoUrl: string;

  @IsString()
  @IsOptional()
  comentario?: string;
}

export class ReviewDeliverableDto {
  @IsEnum(['aprobado', 'observado'])
  estado: string;
  @IsString()
  @IsOptional()
  retroalimentacion?: string;
}