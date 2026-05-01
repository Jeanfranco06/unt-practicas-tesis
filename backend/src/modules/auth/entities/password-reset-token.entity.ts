import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('password_reset_token')
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  token: string;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @Column({ name: 'expira_en', type: 'timestamp' })
  expiraEn: Date;

  @Column({ default: false })
  usado: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
