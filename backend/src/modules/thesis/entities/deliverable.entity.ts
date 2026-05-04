import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ThesisProject } from './thesis-project.entity';
import { DeliverableSubmission } from './deliverable-submission.entity';

@Entity('entregable_tesis_mejorado')
export class Deliverable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tesis_id' })
  proyectoId: number;

  @ManyToOne(() => ThesisProject, (proj) => proj.entregables)
  @JoinColumn({ name: 'tesis_id' })
  proyecto: ThesisProject;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'fecha_limite', type: 'date' })
  fechaLimite: Date;

  @Column({ type: 'int' })
  orden: number;

  @Column({ name: 'documento_referencia_url', nullable: true, length: 500 })
  documentoReferenciaUrl: string;

  @OneToMany(() => DeliverableSubmission, (sub) => sub.entregable)
  entregas: DeliverableSubmission[];
}