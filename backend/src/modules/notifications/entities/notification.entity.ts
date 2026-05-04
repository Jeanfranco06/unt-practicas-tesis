import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificacionTipo {
  INFO = 'info',
  EXITO = 'exito',
  ADVERTENCIA = 'advertencia',
  ERROR = 'error',
}

@Entity('notificacion')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ type: 'enum', enum: NotificacionTipo, default: NotificacionTipo.INFO })
  tipo: NotificacionTipo;

  @Column({ default: false })
  leido: boolean;

  @Column({ default: false })
  archivada: boolean;

  @Column({ default: 'low' })
  prioridad: string;

  @Column({ type: 'jsonb', nullable: true })
  datos: any;

  @Column({ name: 'entidad_referenciada', nullable: true })
  entidadReferenciada: string;

  @Column({ name: 'id_referenciado', nullable: true })
  idReferenciado: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}