import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
// import { ThesisProject } from './thesis-project.entity';
import { Student } from '../../students/entities/student.entity';
// import { ThesisAdvisor } from './thesis-advisor.entity';
// import { ThesisDeliverable } from './thesis-deliverable.entity';

export enum ThesisState {
  EN_REGISTRO = 'en_registro',
  PROPUESTO = 'propuesto',
  APROBADO = 'aprobado',
  EN_DESARROLLO = 'en_desarrollo',
  EN_REVISION = 'en_revision',
  CULMINADO = 'culminado',
  DESAPROBADO = 'desaprobado',
}

export enum DefenseResult {
  APROBADO = 'aprobado',
  DESAPROBADO = 'desaprobado',
}

@Entity('tesis')
export class Thesis {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({ name: 'proyecto_id', unique: true })
  // proyectoId: number;

  // @OneToOne(() => ThesisProject)
  // @JoinColumn({ name: 'proyecto_id' })
  // proyecto: ThesisProject;

  @Column({ name: 'estudiante_id' })
  estudianteId: number;

  @ManyToOne(() => Student, (student: any) => student.tesis)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Student;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'text' })
  resumen: string;

  @Column({ name: 'area_conocimiento', length: 100 })
  areaConocimiento: string;

  @Column({ type: 'enum', enum: ThesisState, default: ThesisState.EN_REGISTRO })
  estado: ThesisState;

  @Column({ name: 'fecha_registro', type: 'date', default: () => 'CURRENT_DATE' })
  fechaRegistro: Date;

  @Column({ name: 'fecha_aprobacion', type: 'date', nullable: true })
  fechaAprobacion: Date;

  @Column({ name: 'fecha_sustentacion', type: 'date', nullable: true })
  fechaSustentacion: Date;

  @Column({ name: 'nota_final', type: 'numeric', precision: 5, scale: 2, nullable: true })
  notaFinal: number;

  @Column({ name: 'resultado_sustentacion', type: 'enum', enum: DefenseResult, nullable: true })
  resultadoSustentacion: DefenseResult;

  // @OneToMany(() => ThesisAdvisor, (advisor) => advisor.tesis)
  // asesores: ThesisAdvisor[];

  // @OneToMany(() => ThesisDeliverable, (deliverable) => deliverable.tesis)
  // entregables: ThesisDeliverable[];
}
