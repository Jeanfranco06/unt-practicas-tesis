import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';
import { PaymentConcept } from './payment-concept.entity';

export enum PaymentStatus {
  PENDIENTE = 'pendiente',
  PROCESANDO = 'procesando',
  COMPLETADO = 'completado',
  RECHAZADO = 'rechazado',
  REEMBOLSADO = 'reembolsado',
  CANCELADO = 'cancelado',
}

export enum PaymentMethod {
  EFECTIVO = 'efectivo',
  DEPOSITO = 'deposito',
  TRANSFERENCIA = 'transferencia',
  TARJETA = 'tarjeta',
  YAPE = 'yape',
  PLIN = 'plin',
  OTRO = 'otro',
}

@Entity('pago')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'codigo_pago', length: 30, unique: true })
  codigoPago: string;

  @Column({ name: 'estudiante_id', type: 'int' })
  estudianteId: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Student;

  @Column({ name: 'concepto_id', type: 'int' })
  conceptoId: number;

  @ManyToOne(() => PaymentConcept)
  @JoinColumn({ name: 'concepto_id' })
  concepto: PaymentConcept;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDIENTE,
  })
  estado: PaymentStatus;

  @Column({ name: 'metodo_pago', type: 'enum', enum: PaymentMethod, nullable: true })
  metodoPago: PaymentMethod | null;

  @Column({ name: 'referencia_pago', type: 'varchar', length: 100, nullable: true })
  referenciaPago: string | null;

  @Column({ name: 'fecha_pago', type: 'timestamp', nullable: true })
  fechaPago: Date | null;

  @Column({ name: 'fecha_vencimiento', type: 'date', nullable: true })
  fechaVencimiento: Date | null;

  @Column({ name: 'comprobante_url', type: 'varchar', length: 500, nullable: true })
  comprobanteUrl: string | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @Column({ name: 'registrado_por', type: 'int', nullable: true })
  registradoPor: number | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'registrado_por' })
  registradoPorUsuario: User | null;

  @Column({ name: 'aprobado_por', type: 'int', nullable: true })
  aprobadoPor: number | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'aprobado_por' })
  aprobadoPorUsuario: User | null;

  @Column({ name: 'fecha_aprobacion', type: 'timestamp', nullable: true })
  fechaAprobacion: Date | null;

  @Column({ name: 'motivo_rechazo', type: 'text', nullable: true })
  motivoRechazo: string | null;

  @Column({ name: 'datos_adicionales', type: 'jsonb', nullable: true })
  datosAdicionales: Record<string, any> | null;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
