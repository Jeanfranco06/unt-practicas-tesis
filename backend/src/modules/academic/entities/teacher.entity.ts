import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Career } from './career.entity';
// import { ThesisAdvisor } from '../../thesis/entities/thesis-advisor.entity';

@Entity('docente')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id', unique: true })
  usuarioId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ name: 'carrera_id' })
  carreraId: number;

  @ManyToOne(() => Career, (career) => career.docentes)
  @JoinColumn({ name: 'carrera_id' })
  carrera: Career;

  @Column({ length: 200, nullable: true })
  especialidad: string;

  @Column({ length: 100, nullable: true })
  categoria: string;

  @Column({ length: 50, nullable: true })
  dedicacion: string;

  @Column({ length: 50, nullable: true })
  oficina: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  // @OneToMany(() => ThesisAdvisor, (advisor) => advisor.docente)
  // asignacionesTesis: ThesisAdvisor[];
}
