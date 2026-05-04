import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ThesisProject } from './thesis-project.entity';
import { User } from '../../users/entities/user.entity';

export enum AsignacionTipo {
  ASESOR = 'asesor',
  JURADO = 'jurado',
}

export enum RolJurado {
  PRESIDENTE = 'presidente',
  SECRETARIO = 'secretario',
  VOCAL = 'vocal',
}

@Entity('asesor_tesis')
export class ThesisAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tesis_id', type: 'int' })
  proyectoId: number;

  @ManyToOne(() => ThesisProject, (proj) => proj.asignaciones)
  @JoinColumn({ name: 'tesis_id' })
  proyecto: ThesisProject;

  @Column({ name: 'docente_id', type: 'int' })
  docenteId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'docente_id' })
  docente: User;

  @Column({ name: 'tipo_asignacion', type: 'enum', enum: AsignacionTipo })
  tipo: AsignacionTipo;

  @Column({ name: 'rol_jurado', type: 'enum', enum: RolJurado, nullable: true })
  rolEspecifico: RolJurado | null;

  @Column({ name: 'fecha_asignacion', type: 'date', default: () => 'CURRENT_DATE' })
  fechaAsignacion: Date;

  @Column({ default: true })
  activo: boolean;
}