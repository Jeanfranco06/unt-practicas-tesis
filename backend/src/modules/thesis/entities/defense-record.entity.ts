import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { ThesisProject } from './thesis-project.entity';

export enum ResultadoSustentacion {
  APROBADO = 'aprobado',
  DESAPROBADO = 'desaprobado',
}

@Entity('acta_sustentacion')
export class DefenseRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'proyecto_id', unique: true })
  proyectoId: number;

  @ManyToOne(() => ThesisProject, (proj) => proj.acta)
  @JoinColumn({ name: 'proyecto_id' })
  proyecto: ThesisProject;

  @Column({ name: 'fecha_sustentacion', type: 'date' })
  fechaSustentacion: Date;

  @Column({ name: 'hora_inicio', length: 8 })
  horaInicio: string;

  @Column({ name: 'hora_fin', length: 8 })
  horaFin: string;

  @Column({ length: 200 })
  lugar: string;

  @Column({ name: 'nota_final', type: 'numeric', precision: 5, scale: 2 })
  notaFinal: number;

  @Column({ type: 'enum', enum: ResultadoSustentacion })
  resultado: ResultadoSustentacion;

  @Column({ name: 'url_acta_firmada', length: 500, nullable: true })
  urlActaFirmada: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}