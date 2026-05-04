import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ThesisDeliverable } from './thesis-deliverable.entity';
import { Student } from '../../students/entities/student.entity';
import { Teacher } from '../../academic/entities/teacher.entity';

export enum SubmissionState {
  ENTREGADO = 'entregado',
  REVISANDO = 'revisando',
  APROBADO = 'aprobado',
  OBSERVADO = 'observado',
}

@Entity('entrega_tesis_mejorada')
export class ThesisSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'entregable_id' })
  entregableId: number;

  @ManyToOne(() => ThesisDeliverable, (deliverable: any) => deliverable)
  @JoinColumn({ name: 'entregable_id' })
  entregable: ThesisDeliverable;

  @Column({ name: 'estudiante_id' })
  estudianteId: number;

  @ManyToOne(() => Student, (student) => student.entregasTesis)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Student;

  @Column({ name: 'titulo_entrega', length: 200 })
  tituloEntrega: string;

  @Column({ name: 'documento_url', length: 500 })
  documentoUrl: string;

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @Column({ name: 'fecha_entrega', type: 'date', default: () => 'CURRENT_DATE' })
  fechaEntrega: Date;

  @Column({ type: 'enum', enum: SubmissionState, default: SubmissionState.ENTREGADO })
  estado: SubmissionState;

  @Column({ name: 'retroalimentacion_asesor', type: 'text', nullable: true })
  retroalimentacionAsesor: string;

  @Column({ name: 'fecha_revision', type: 'date', nullable: true })
  fechaRevision: Date;

  @Column({ name: 'revisado_por', nullable: true })
  revisadoPor: number;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'revisado_por' })
  revisor: Teacher;
}
