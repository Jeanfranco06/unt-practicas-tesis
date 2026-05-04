import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Company } from './company.entity';

@Entity('representante_empresa')
export class CompanyRepresentative {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @ManyToOne(() => Company, (company) => company.representantes)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Company;

  @Column({ name: 'usuario_id', unique: true })
  usuarioId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ length: 100, nullable: true })
  cargo: string;

  @Column({ length: 100, nullable: true })
  departamento: string;

  @Column({ name: 'telefono_directo', length: 20, nullable: true })
  telefonoDirecto: string;

  @Column({ name: 'es_principal', default: false })
  esPrincipal: boolean;
}
