import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany } from 'typeorm';
import { User } from './user.entity';

export enum RoleName {
  ADMIN = 'Administrador',
  COORDINADOR = 'Coordinador',
  ASESOR = 'Asesor',
  ESTUDIANTE = 'Estudiante',
  REPRESENTANTE_EMPRESA = 'RepresentanteEmpresa',
  SECRETARIA = 'Secretaria',
}

@Entity('rol')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  nombre: RoleName;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
