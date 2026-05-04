import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Thesis } from './thesis.entity';
import { Teacher } from '../../academic/entities/teacher.entity';

export enum AssignmentType {
  ASESOR = 'asesor',
  JURADO = 'jurado',
}

export enum JuryRole {
  PRESIDENTE = 'presidente',
  SECRETARIO = 'secretario',
  VOCAL = 'vocal',
}

@Entity('asesor_tesis')
export class ThesisAdvisor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tesis_id' })
  tesisId: number;

  // @ManyToOne(() => Thesis, (thesis) => thesis.asesores)
  // @JoinColumn({ name: 'tesis_id' })
  // tesis: Thesis;

  @Column({ name: 'docente_id' })
  docenteId: number;

  @ManyToOne(() => Teacher, (teacher: any) => teacher)
  @JoinColumn({ name: 'docente_id' })
  docente: Teacher;

  @Column({ type: 'enum', enum: AssignmentType })
  tipo: AssignmentType;

  @Column({ name: 'rol_especifico', type: 'enum', enum: JuryRole, nullable: true })
  rolEspecifico: JuryRole;

  @Column({ name: 'fecha_asignacion', type: 'date', default: () => 'CURRENT_DATE' })
  fechaAsignacion: Date;

  @Column({ default: true })
  activo: boolean;
}
