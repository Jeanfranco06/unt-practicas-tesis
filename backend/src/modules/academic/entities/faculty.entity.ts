import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Career } from './career.entity';

@Entity('facultad')
export class Faculty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 200 })
  nombre: string;

  @Column({ unique: true, length: 10 })
  codigo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @OneToMany(() => Career, (career) => career.facultad)
  carreras: Career[];
}
