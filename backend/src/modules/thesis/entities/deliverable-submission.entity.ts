import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Deliverable } from './deliverable.entity';
import { Student } from '../../students/entities/student.entity';

export enum EntregaEstado {
  ENTREGADO = 'entregado',
  REVISANDO = 'revisando',
  APROBADO = 'aprobado',
  OBSERVADO = 'observado',
}

@Entity('entrega_tesis_mejorada')
export class DeliverableSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'entregable_id' })
  entregableId: number;

  @ManyToOne(() => Deliverable, (del) => del.entregas)
  @JoinColumn({ name: 'entregable_id' })
  entregable: Deliverable;

  @Column({ name: 'estudiante_id' })
  estudianteId: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Student;

  
  @Column({ name: 'documento_url', length: 500 })
  documentoUrl: string;

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @Column({ name: 'fecha_entrega', type: 'date', default: () => 'CURRENT_DATE' })
  fechaEntrega: Date;

  @Column({ type: 'enum', enum: EntregaEstado, default: EntregaEstado.ENTREGADO })
  estado: EntregaEstado;

  @Column({ name: 'retroalimentacion_asesor', type: 'text', nullable: true })
  retroalimentacionAsesor: string;

  @Column({ name: 'fecha_revision', type: 'date', nullable: true })
  fechaRevision: Date | null;

  @Column({ name: 'revisado_por', type: 'int', nullable: true })
  revisadoPor: number | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}