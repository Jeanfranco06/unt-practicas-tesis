import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
// import { Thesis } from './thesis.entity';
// import { ThesisSubmission } from './thesis-submission.entity';

@Entity('entregable_tesis_mejorado')
export class ThesisDeliverable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tesis_id' })
  tesisId: number;

  // @ManyToOne(() => Thesis, (thesis) => thesis.entregables)
  // @JoinColumn({ name: 'tesis_id' })
  // tesis: Thesis;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'fecha_limite', type: 'date' })
  fechaLimite: Date;

  @Column()
  orden: number;

  @Column({ name: 'tipo_entregable', length: 50, nullable: true })
  tipoEntregable: string;

  @Column({ name: 'documento_plantilla_url', length: 500, nullable: true })
  documentoPlantillaUrl: string;

  // @OneToMany(() => ThesisSubmission, (submission) => submission.entregable)
  // entregas: ThesisSubmission[];
}
