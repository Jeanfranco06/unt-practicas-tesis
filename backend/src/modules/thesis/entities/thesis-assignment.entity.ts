import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
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

@Entity('asignacion_tesis')
export class ThesisAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'proyecto_id' })
  proyectoId: number;

  @ManyToOne(() => ThesisProject, (proj) => proj.asignaciones)
  proyecto: ThesisProject;

  @Column({ name: 'docente_id' })
  docenteId: number;

  @ManyToOne(() => User)
  docente: User;

  @Column({ type: 'enum', enum: AsignacionTipo })
  tipo: AsignacionTipo;

  @Column({ name: 'rol_especifico', type: 'enum', enum: RolJurado, nullable: true })
  rolEspecifico: RolJurado | null;

  @Column({ name: 'fecha_asignacion', type: 'date', default: () => 'CURRENT_DATE' })
  fechaAsignacion: Date;

  @Column({ default: true })
  activo: boolean;
}