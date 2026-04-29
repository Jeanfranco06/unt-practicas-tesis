import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

export enum TipoConvenio {
  MARCO = 'marco',
  ESPECIFICO = 'especifico',
}

export enum EstadoConvenio {
  VIGENTE = 'vigente',
  VENCIDO = 'vencido',
  RENOVADO = 'renovado',
}

@Entity('convenio')
export class Agreement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @ManyToOne(() => Company, (company) => company.convenios)
  empresa: Company;

  @Column({ type: 'enum', enum: TipoConvenio })
  tipo: TipoConvenio;

  @Column({ name: 'objeto_contrato', type: 'text' })
  objetoContrato: string;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: Date;

  @Column({ name: 'fecha_vencimiento', type: 'date' })
  fechaVencimiento: Date;

  @Column({ type: 'enum', enum: EstadoConvenio, default: EstadoConvenio.VIGENTE })
  estado: EstadoConvenio;

  @Column({ name: 'documento_url', nullable: true, length: 500 })
  documentoUrl: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}