import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
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

@Entity('practica')
export class Internship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'postulacion_id', unique: true })
  postulacionId: number;

  @ManyToOne(() => InternshipApplication)
  postulacion: InternshipApplication;

  @Column({ name: 'estudiante_id' })
  estudianteId: number;

  @ManyToOne(() => Student)
  estudiante: Student;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @ManyToOne(() => Company)
  empresa: Company;

  @Column({ name: 'asesor_academico_id' })
  asesorAcademicoId: number;

  @ManyToOne(() => User)
  asesorAcademico: User;

  @Column({ name: 'asesor_empresa_nombre', length: 200 })
  asesorEmpresaNombre: string;

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

  @OneToMany(() => FinalEvaluation, (eval) => eval.practica)
  evaluacion: FinalEvaluation[];
}