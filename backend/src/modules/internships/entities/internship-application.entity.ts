import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { InternshipOffer } from './internship-offer.entity';
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';

export enum ApplicationEstado {
  POSTULADO = 'postulado',
  PRESELECCIONADO = 'preseleccionado',
  RECHAZADO = 'rechazado',
  APROBADO = 'aprobado',
}

@Entity('postulacion')
export class InternshipApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'oferta_id' })
  ofertaId: number;

  @ManyToOne(() => InternshipOffer)
  oferta: InternshipOffer;

  @Column({ name: 'estudiante_id' })
  estudianteId: number;

  @ManyToOne(() => Student)
  estudiante: Student;

  @Column({ name: 'documento_cv_url', nullable: true, length: 500 })
  documentoCvUrl: string;

  @Column({ type: 'text', nullable: true })
  cartaPresentacion: string;

  @Column({ type: 'enum', enum: ApplicationEstado, default: ApplicationEstado.POSTULADO })
  estado: ApplicationEstado;

  @CreateDateColumn({ name: 'fecha_postulacion' })
  fechaPostulacion: Date;

  @Column({ name: 'fecha_revision', nullable: true, type: 'timestamp' })
  fechaRevision: Date;

  @Column({ name: 'revisado_por', nullable: true })
  revisadoPor: number;

  @ManyToOne(() => User, { nullable: true })
  revisor: User;
}