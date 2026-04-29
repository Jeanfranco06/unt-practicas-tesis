import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Agreement } from '../../agreements/entities/agreement.entity';
import { InternshipOffer } from '../../internships/entities/internship-offer.entity';

@Entity('empresa')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 11 })
  ruc: string;

  @Column({ name: 'razon_social', length: 200 })
  razonSocial: string;

  @Column({ name: 'nombre_comercial', nullable: true, length: 200 })
  nombreComercial: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ name: 'email_contacto', length: 255, nullable: true })
  emailContacto: string;

  @Column({ name: 'representante_nombre', length: 200, nullable: true })
  representanteNombre: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @OneToMany(() => Agreement, (agreement) => agreement.empresa)
  convenios: Agreement[];

  @OneToMany(() => InternshipOffer, (offer) => offer.empresa)
  ofertas: InternshipOffer[];
}