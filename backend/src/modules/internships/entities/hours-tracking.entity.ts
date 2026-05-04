import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Internship } from './internship.entity';

@Entity('seguimiento_horas')
export class HoursTracking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'practica_id' })
  practicaId: number;

  @ManyToOne(() => Internship)
  @JoinColumn({ name: 'practica_id' })
  practica: Internship;

  @Column({ name: 'fecha_trabajada', type: 'date' })
  fechaTrabajada: Date;

  @Column({ type: 'int' })
  horas: number;

  @Column({ name: 'descripcion_actividad', type: 'text' })
  descripcionActividad: string;

  @Column({ name: 'evidencia_url', nullable: true, length: 500 })
  evidenciaUrl: string;

  @Column({ name: 'aprobado_empresa', default: false })
  aprobadoEmpresa: boolean;

  @Column({ name: 'aprobado_asesor', default: false })
  aprobadoAsesor: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}