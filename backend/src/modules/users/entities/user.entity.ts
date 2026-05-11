import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, JoinTable } from 'typeorm';
// import { Role } from './role.entity';

export enum RolUsuario {
  ADMIN = 'ADMIN',
  COORDINADOR = 'COORDINADOR',
  ASESOR = 'ASESOR',
  ESTUDIANTE = 'ESTUDIANTE',
  REPRESENTANTE_EMPRESA = 'REPRESENTANTE_EMPRESA',
  SECRETARIA = 'SECRETARIA'
}

@Entity('usuario')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'email_recuperacion', nullable: false })
  emailRecuperacion: string;

  @Column({ name: 'contrasena_hash' })
  contrasenaHash: string;

  @Column()
  nombre: string;

  @Column({ name: 'apellido_paterno' })
  apellidoPaterno: string;

  @Column({ name: 'apellido_materno' })
  apellidoMaterno: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @Column({ name: 'refresh_token', type: 'varchar', nullable: true })
  refreshToken: string | null;

  @Column({ name: 'refresh_token_expira', type: 'timestamp', nullable: true })
  refreshTokenExpira: Date | null;

  @Column({ name: 'eliminado', type: 'boolean', default: false })
  eliminado: boolean;

  @Column({ name: 'eliminado_en', type: 'timestamp', nullable: true })
  eliminadoEn: Date | null;

  // Campo que no existe en la BD pero se usa en memoria
  rol: RolUsuario;

  // @ManyToMany(() => Role, (role) => role.users, { eager: true })
  // @JoinTable({
  //   name: 'usuario_rol',
  //   joinColumn: { name: 'usuario_id', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'rol_id', referencedColumnName: 'id' }
  // })
  roles: any[];
}