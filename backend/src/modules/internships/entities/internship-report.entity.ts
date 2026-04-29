import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Internship } from './internship.entity';

export enum ReporteTipo {
  PARCIAL = 'parcial',
  FINAL = 'final',
}

export enum ReporteEstado {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  OBSERVADO = 'observado',
}

@Entity('informe_practica')
export class InternshipReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'practica_id' })
  practicaId: number;

  @ManyToOne(() => Internship)
  practica: Internship;

  @Column({ type: 'enum', enum: ReporteTipo })
  tipo: ReporteTipo;

  @Column({ length: 200 })
  titulo: string;

  @Column({ name: 'contenido_resumen', type: 'text', nullable: true })
  contenidoResumen: string;

  @Column({ name: 'documento_url', length: 500, nullable: true })
  documentoUrl: string;

  @Column({ name: 'fecha_entrega', type: 'date' })
  fechaEntrega: Date;

  @Column({ type: 'enum', enum: ReporteEstado, default: ReporteEstado.PENDIENTE })
  estado: ReporteEstado;

  @Column({ name: 'comentario_asesor', type: 'text', nullable: true })
  comentarioAsesor: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}