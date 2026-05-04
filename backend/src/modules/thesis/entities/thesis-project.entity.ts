import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { ThesisAssignment } from './thesis-assignment.entity';
import { Deliverable } from './deliverable.entity';
import { DefenseRecord } from './defense-record.entity';

export enum ThesisEstado {
  EN_REGISTRO = 'en_registro',
  PROPUESTO = 'propuesto',
  APROBADO = 'aprobado',
  EN_DESARROLLO = 'en_desarrollo',
  EN_REVISION = 'en_revision',
  CULMINADO = 'culminado',
  DESAPROBADO = 'desaprobado',
  CANCELADO = 'cancelado',
}

@Entity('proyecto_tesis')
export class ThesisProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'estudiante_id' })
  estudianteId: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Student;

  @Column({ default: true })
  activo: boolean;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'text' })
  resumen: string;

  @Column({ name: 'area_conocimiento', length: 100 })
  areaConocimiento: string;

  @Column({ type: 'enum', enum: ThesisEstado, default: ThesisEstado.EN_REGISTRO })
  estado: ThesisEstado;

  @CreateDateColumn({ name: 'fecha_registro', type: 'date' })
  fechaRegistro: Date;

  @Column({ name: 'fecha_aprobacion', type: 'date', nullable: true })
  fechaAprobacion: Date | null;

  @Column({ name: 'asesor_sugerido_id', type: 'integer', nullable: true })
  asesorSugeridoId: number | null;  // Estudiante sugiere un asesor

  @Column({ name: 'fecha_sugerencia_asesor', type: 'timestamp', nullable: true })
  fechaSugerenciaAsesor: Date | null;

  @OneToMany(() => ThesisAssignment, (ass) => ass.proyecto)
  asignaciones: ThesisAssignment[];

  @OneToMany(() => Deliverable, (del) => del.proyecto)
  entregables: Deliverable[];

  @OneToMany(() => DefenseRecord, (def) => def.proyecto)
  acta: DefenseRecord[];
}