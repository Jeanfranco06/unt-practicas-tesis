import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Deliverable } from './deliverable.entity';
import { Student } from '../../students/entities/student.entity';

export enum EntregaEstado {
  ENTREGADO = 'entregado',
  REVISANDO = 'revisando',
  APROBADO = 'aprobado',
  OBSERVADO = 'observado',
}

@Entity('entrega_tesis')
export class DeliverableSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'entregable_id' })
  entregableId: number;

  @ManyToOne(() => Deliverable, (del) => del.entregas)
  entregable: Deliverable;

  @Column({ name: 'estudiante_id' })
  estudianteId: number;

  @ManyToOne(() => Student)
  estudiante: Student;

  @Column({ name: 'titulo_entrega', length: 200 })
  tituloEntrega: string;

  @Column({ name: 'documento_url', length: 500 })
  documentoUrl: string;

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @Column({ name: 'fecha_entrega', type: 'date', default: () => 'CURRENT_DATE' })
  fechaEntrega: Date;

  @Column({ type: 'enum', enum: EntregaEstado, default: EntregaEstado.ENTREGADO })
  estado: EntregaEstado;

  @Column({ name: 'retroalimentacion_docente', type: 'text', nullable: true })
  retroalimentacionDocente: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}