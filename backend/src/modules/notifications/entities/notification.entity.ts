import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
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
  usuario: User;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ type: 'enum', enum: NotificacionTipo, default: NotificacionTipo.INFO })
  tipo: NotificacionTipo;

  @Column({ default: false })
  leido: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}