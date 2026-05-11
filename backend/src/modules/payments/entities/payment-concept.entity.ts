import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Career } from '../../academic/entities/career.entity';

export enum PaymentType {
  MATRICULA = 'matricula',
  TRAMITE = 'tramite',
  CONSTANCIA = 'constancia',
  CERTIFICADO = 'certificado',
  OTRO = 'otro',
}

@Entity('concepto_pago')
export class PaymentConcept {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  codigo: string;

  @Column({ length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.OTRO,
  })
  tipo: PaymentType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({ name: 'carrera_id', type: 'int', nullable: true })
  carreraId: number | null;

  @ManyToOne(() => Career)
  @JoinColumn({ name: 'carrera_id' })
  carrera: Career | null;

  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'requiere_aprobacion', default: false })
  requiereAprobacion: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @CreateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
