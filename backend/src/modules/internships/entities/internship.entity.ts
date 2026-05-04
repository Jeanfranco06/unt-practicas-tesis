import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';
import { InternshipApplication } from './internship-application.entity';
import { HoursTracking } from './hours-tracking.entity';
import { InternshipReport } from './internship-report.entity';
import { FinalEvaluation } from './final-evaluation.entity';

export enum InternshipEstado {
  PENDIENTE_ASIGNACION = 'pendiente_asignacion',
  ACTIVA = 'activa',
  EN_EVALUACION = 'en_evaluacion',
  FINALIZADA = 'finalizada',
  CANCELADA = 'cancelada',
}

export enum PracticaOrigen {
  INSTITUCIONAL = 'institucional',
  EXTERNA = 'externa',
}

@Entity('practica')
export class Internship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'postulacion_id', type: 'int', unique: true })
  postulacionId: number;

  @ManyToOne(() => InternshipApplication)
  @JoinColumn({ name: 'postulacion_id' })
  postulacion: InternshipApplication;

  @Column({ name: 'estudiante_id', type: 'int' })
  estudianteId: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Student;

  @Column({ name: 'empresa_id', type: 'int' })
  empresaId: number;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Company;

  @Column({ name: 'asesor_academico_id', type: 'int', nullable: true })
  asesorAcademicoId: number | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'asesor_academico_id' })
  asesorAcademico: User;

  @Column({ name: 'asesor_empresa_nombre', length: 200 })
  asesorEmpresaNombre: string;

  @Column({ type: 'enum', enum: PracticaOrigen, default: PracticaOrigen.INSTITUCIONAL })
  origen: PracticaOrigen;

  @Column({ name: 'horas_totales_requeridas', type: 'int' })
  horasTotalesRequeridas: number;

  @Column({ name: 'horas_completadas', type: 'int', default: 0 })
  horasCompletadas: number;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin: Date;

  @Column({ type: 'enum', enum: InternshipEstado, default: InternshipEstado.PENDIENTE_ASIGNACION })
  estado: InternshipEstado;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @OneToMany(() => HoursTracking, (track) => track.practica)
  seguimientos: HoursTracking[];

  @OneToMany(() => InternshipReport, (report) => report.practica)
  informes: InternshipReport[];

  @OneToMany(() => FinalEvaluation, (finalEval) => finalEval.practica)
  evaluacion: FinalEvaluation[];
}