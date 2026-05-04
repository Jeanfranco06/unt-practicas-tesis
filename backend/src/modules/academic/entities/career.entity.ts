import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Faculty } from './faculty.entity';
import { Student } from '../../students/entities/student.entity';

@Entity('carrera')
export class Career {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'facultad_id' })
  facultadId: number;

  @ManyToOne(() => Faculty, (faculty) => faculty.carreras)
  @JoinColumn({ name: 'facultad_id' })
  facultad: Faculty;

  @Column({ length: 200 })
  nombre: string;

  @Column({ length: 10 })
  codigo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @OneToMany(() => Student, (student: any) => student.carrera)
  estudiantes: Student[];

  // @OneToMany(() => Teacher, (teacher: any) => teacher.carrera)
  docentes: any[];
}
