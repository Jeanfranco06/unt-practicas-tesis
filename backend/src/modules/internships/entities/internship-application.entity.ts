import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
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
  @JoinColumn({ name: 'oferta_id' })
  oferta: InternshipOffer;

  @Column({ name: 'estudiante_id' })
  estudianteId: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Student;

  @Column({ name: 'cv_url', nullable: true, length: 500 })
  documentoCvUrl: string;

  @Column({ name: 'carta_presentacion', type: 'text', nullable: true })
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
  @JoinColumn({ name: 'revisado_por' })
  revisor: User;
}