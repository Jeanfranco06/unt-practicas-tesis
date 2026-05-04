import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

export enum TipoConvenio {
  MARCO = 'marco',
  ESPECIFICO = 'especifico',
}

export enum EstadoConvenio {
  VIGENTE = 'vigente',
  VENCIDO = 'vencido',
  CANCELADO = 'cancelado',
}

// Helper para calcular el estado real basado en la fecha
export function calcularEstadoConvenio(fechaVencimiento: Date): EstadoConvenio {
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  return vencimiento >= hoy ? EstadoConvenio.VIGENTE : EstadoConvenio.VENCIDO;
}

// Helper para normalizar estados antiguos (migración de datos)
export function normalizarEstadoConvenio(estadoAlmacenado: string, fechaVencimiento: Date): EstadoConvenio {
  // Estado cancelado se respeta siempre
  if (estadoAlmacenado === EstadoConvenio.CANCELADO) {
    return EstadoConvenio.CANCELADO;
  }
  
  // Estados antiguos o vigente/vencido se calculan por fecha
  // 'renovado' (antiguo) se trata como vigente/vencido según fecha
  return calcularEstadoConvenio(fechaVencimiento);
}

@Entity('convenio')
export class Agreement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @ManyToOne(() => Company, (company) => company.convenios)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Company;

  @Column({ type: 'enum', enum: TipoConvenio })
  tipo: TipoConvenio;

  @Column({ type: 'text', name: 'objeto' })
  objeto: string;

  // Getter para compatibilidad con DTO
  get objetoContrato(): string {
    return this.objeto;
  }

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: Date;

  @Column({ name: 'fecha_vencimiento', type: 'date' })
  fechaVencimiento: Date;

  @Column({ type: 'enum', enum: EstadoConvenio, default: EstadoConvenio.VIGENTE })
  estado: EstadoConvenio;

  // Método para obtener el estado real calculado
  getEstadoReal(): EstadoConvenio {
    return calcularEstadoConvenio(this.fechaVencimiento);
  }

  @Column({ name: 'documento_url', nullable: true, length: 500 })
  documentoUrl: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}