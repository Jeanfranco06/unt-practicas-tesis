import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Internship } from './internship.entity';

@Entity('evaluacion_final_practica')
export class FinalEvaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'practica_id', unique: true })
  practicaId: number;

  @ManyToOne(() => Internship)
  @JoinColumn({ name: 'practica_id' })
  practica: Internship;

  @Column({ name: 'calificacion_empresa', type: 'int' })
  calificacionEmpresa: number;

  @Column({ name: 'calificacion_asesor', type: 'int' })
  calificacionAsesor: number;

  @Column({ type: 'text', nullable: true })
  retroalimentacion: string;

  @Column({ name: 'fecha_evaluacion', type: 'date', default: () => 'CURRENT_DATE' })
  fechaEvaluacion: Date;

  @Column({ type: 'boolean' })
  apto: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}