import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Career } from '../../academic/entities/career.entity';
import { Thesis } from '../../thesis/entities/thesis.entity';
import { ThesisSubmission } from '../../thesis/entities/thesis-submission.entity';

@Entity('estudiante')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id', unique: true })
  usuarioId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ name: 'codigo_universitario', unique: true, length: 20 })
  codigoUniversitario: string;

  @Column({ name: 'anio_ingreso', type: 'int' })
  anioIngreso: number;

  @Column({ name: 'carrera_id' })
  carreraId: number;

  @Column({ name: 'escuela_profesional', length: 100, nullable: true })
  escuelaProfesional: string;

  @ManyToOne(() => Career, (career) => career.estudiantes)
  @JoinColumn({ name: 'carrera_id' })
  carrera: Career;

  @Column({ name: 'expediente_academico_url', nullable: true, length: 500 })
  expedienteAcademicoUrl: string;

  @Column({ name: 'promedio_general', type: 'numeric', precision: 4, scale: 2, nullable: true })
  promedioGeneral: number;

  @Column({ name: 'creditos_aprobados', default: 0 })
  creditosAprobados: number;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => Thesis, (thesis) => thesis.estudiante)
  tesis: Thesis[];

  @OneToMany(() => ThesisSubmission, (submission) => submission.estudiante)
  entregasTesis: ThesisSubmission[];
}