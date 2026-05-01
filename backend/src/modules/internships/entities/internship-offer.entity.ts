import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Agreement } from '../../agreements/entities/agreement.entity';

export enum OfertaEstado {
  BORRADOR = 'borrador',
  PUBLICADA = 'publicada',
  CERRADA = 'cerrada',
  CANCELADA = 'cancelada',
}

@Entity('oferta_practica')
export class InternshipOffer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Company;

  @Column({ name: 'convenio_id', nullable: true })
  convenioId: number;

  @ManyToOne(() => Agreement, { nullable: true })
  convenio: Agreement;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'text' })
  requisitos: string;

  @Column({ name: 'fecha_inicio_postulacion', type: 'date' })
  fechaInicioPostulacion: Date;

  @Column({ name: 'fecha_fin_postulacion', type: 'date' })
  fechaFinPostulacion: Date;

  @Column({ name: 'fecha_inicio_practica', type: 'date' })
  fechaInicioPractica: Date;

  @Column({ name: 'fecha_fin_practica', type: 'date' })
  fechaFinPractica: Date;

  @Column({ type: 'int' })
  cupos: number;

  @Column({ type: 'enum', enum: OfertaEstado, default: OfertaEstado.BORRADOR })
  estado: OfertaEstado;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}