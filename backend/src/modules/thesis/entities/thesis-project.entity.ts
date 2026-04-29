import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
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
}

@Entity('proyecto_tesis')
export class ThesisProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'estudiante_id' })
  estudianteId: number;

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

  @OneToMany(() => ThesisAssignment, (ass) => ass.proyecto)
  asignaciones: ThesisAssignment[];

  @OneToMany(() => Deliverable, (del) => del.proyecto)
  entregables: Deliverable[];

  @OneToMany(() => DefenseRecord, (def) => def.proyecto)
  acta: DefenseRecord[];
}