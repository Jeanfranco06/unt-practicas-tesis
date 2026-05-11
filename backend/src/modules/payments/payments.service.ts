import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { PaymentConcept } from './entities/payment-concept.entity';
import { Student } from '../students/entities/student.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto, UpdatePaymentStatusDto } from './dto/update-payment.dto';
import { PaymentFiltersDto } from './dto/payment-filters.dto';
import { CreatePaymentConceptDto, UpdatePaymentConceptDto } from './dto/payment-concept.dto';

export interface PaymentStats {
  totalPagos: number;
  montoTotal: number;
  pagosPorEstado: { estado: PaymentStatus; count: number; monto: number }[];
  pagosPorMes: { mes: string; count: number; monto: number }[];
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(PaymentConcept)
    private readonly conceptRepo: Repository<PaymentConcept>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  // ============ CONCEPTOS DE PAGO ============

  async createConcept(dto: CreatePaymentConceptDto): Promise<PaymentConcept> {
    const existing = await this.conceptRepo.findOne({ where: { codigo: dto.codigo } });
    if (existing) {
      throw new BadRequestException(`Ya existe un concepto con el código ${dto.codigo}`);
    }

    const concept = this.conceptRepo.create(dto);
    return this.conceptRepo.save(concept);
  }

  async findAllConcepts(activo?: boolean): Promise<PaymentConcept[]> {
    const where: FindOptionsWhere<PaymentConcept> = {};
    if (activo !== undefined) {
      where.activo = activo;
    }
    return this.conceptRepo.find({ where, order: { nombre: 'ASC' } });
  }

  async findConceptById(id: number): Promise<PaymentConcept> {
    const concept = await this.conceptRepo.findOne({ where: { id } });
    if (!concept) {
      throw new NotFoundException(`Concepto de pago con ID ${id} no encontrado`);
    }
    return concept;
  }

  async updateConcept(id: number, dto: UpdatePaymentConceptDto): Promise<PaymentConcept> {
    const concept = await this.findConceptById(id);
    Object.assign(concept, dto);
    return this.conceptRepo.save(concept);
  }

  async deleteConcept(id: number): Promise<void> {
    const concept = await this.findConceptById(id);
    concept.activo = false;
    await this.conceptRepo.save(concept);
  }

  // ============ PAGOS ============

  async create(dto: CreatePaymentDto, userId?: number): Promise<Payment> {
    // Validar que el concepto existe y está activo
    const concept = await this.conceptRepo.findOne({
      where: { id: dto.conceptoId, activo: true },
    });
    if (!concept) {
      throw new NotFoundException(`Concepto de pago no encontrado o inactivo`);
    }

    // Validar que el estudiante existe
    const student = await this.studentRepo.findOne({ where: { id: dto.estudianteId } });
    if (!student) {
      throw new NotFoundException(`Estudiante no encontrado`);
    }

    // Generar código de pago único
    let codigoPago = '';
    let exists = true;
    let attempts = 0;
    
    while (exists && attempts < 10) {
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      const timestampPart = Date.now().toString().slice(-4);
      codigoPago = `PAG-${randomPart}${timestampPart}`;
      
      exists = !!(await this.paymentRepo.findOne({ where: { codigoPago } }));
      attempts++;
    }

    if (attempts >= 10 || !codigoPago) {
      throw new BadRequestException('No se pudo generar un código de pago único');
    }

    const payment = this.paymentRepo.create({
      ...dto,
      codigoPago,
      estado: dto.estado || PaymentStatus.PENDIENTE,
      registradoPor: userId ?? dto.registradoPor ?? null,
    });

    return this.paymentRepo.save(payment);
  }

  async findAll(filters: PaymentFiltersDto, page: number = 1, limit: number = 20): Promise<{ data: Payment[]; total: number }> {
    const query = this.paymentRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.usuario', 'usuario')
      .leftJoinAndSelect('p.concepto', 'concepto')
      .leftJoinAndSelect('p.registradoPorUsuario', 'registradoPor')
      .leftJoinAndSelect('p.aprobadoPorUsuario', 'aprobadoPor');

    if (filters.estado) {
      query.andWhere('p.estado = :estado', { estado: filters.estado });
    }
    if (filters.estudianteId) {
      query.andWhere('p.estudianteId = :estudianteId', { estudianteId: filters.estudianteId });
    }
    if (filters.conceptoId) {
      query.andWhere('p.conceptoId = :conceptoId', { conceptoId: filters.conceptoId });
    }
    if (filters.metodoPago) {
      query.andWhere('p.metodoPago = :metodoPago', { metodoPago: filters.metodoPago });
    }
    if (filters.fechaDesde && filters.fechaHasta) {
      query.andWhere('p.fechaPago BETWEEN :desde AND :hasta', {
        desde: new Date(filters.fechaDesde),
        hasta: new Date(filters.fechaHasta),
      });
    }
    if (filters.busqueda) {
      query.andWhere(
        '(p.codigoPago ILIKE :busqueda OR usuario.nombre ILIKE :busqueda OR usuario.apellidoPaterno ILIKE :busqueda OR usuario.email ILIKE :busqueda)',
        { busqueda: `%${filters.busqueda}%` }
      );
    }

    const [data, total] = await query
      .orderBy('p.creadoEn', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: number): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['estudiante', 'estudiante.usuario', 'concepto', 'registradoPorUsuario', 'aprobadoPorUsuario'],
    });
    if (!payment) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }
    return payment;
  }

  async findByCode(codigoPago: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({
      where: { codigoPago },
      relations: ['estudiante', 'estudiante.usuario', 'concepto', 'registradoPorUsuario', 'aprobadoPorUsuario'],
    });
    if (!payment) {
      throw new NotFoundException(`Pago con código ${codigoPago} no encontrado`);
    }
    return payment;
  }

  async findByStudent(estudianteId: number): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { estudianteId },
      relations: ['concepto'],
      order: { creadoEn: 'DESC' },
    });
  }

  async update(id: number, dto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findById(id);
    Object.assign(payment, dto);
    return this.paymentRepo.save(payment);
  }

  async updateStatus(id: number, dto: UpdatePaymentStatusDto, userId?: number): Promise<Payment> {
    const payment = await this.findById(id);
    
    const oldStatus = payment.estado;
    payment.estado = dto.estado;

    if (dto.estado === PaymentStatus.COMPLETADO) {
      payment.aprobadoPor = userId ?? dto.aprobadoPor ?? null;
      payment.fechaAprobacion = new Date();
      payment.fechaPago = new Date();
    }

    if (dto.estado === PaymentStatus.RECHAZADO && dto.motivoRechazo) {
      payment.motivoRechazo = dto.motivoRechazo;
    }

    return this.paymentRepo.save(payment);
  }

  async approve(id: number, userId: number): Promise<Payment> {
    return this.updateStatus(id, { estado: PaymentStatus.COMPLETADO, aprobadoPor: userId }, userId);
  }

  async reject(id: number, motivo: string, userId: number): Promise<Payment> {
    return this.updateStatus(id, { estado: PaymentStatus.RECHAZADO, motivoRechazo: motivo }, userId);
  }

  async delete(id: number): Promise<void> {
    const payment = await this.findById(id);
    if (payment.estado === PaymentStatus.COMPLETADO) {
      throw new BadRequestException('No se puede eliminar un pago completado');
    }
    await this.paymentRepo.remove(payment);
  }

  // ============ ESTADÍSTICAS ============

  async getStats(fechaDesde?: Date, fechaHasta?: Date): Promise<PaymentStats> {
    const query = this.paymentRepo.createQueryBuilder('p');

    if (fechaDesde && fechaHasta) {
      query.where('p.creadoEn BETWEEN :desde AND :hasta', { desde: fechaDesde, hasta: fechaHasta });
    }

    const pagos = await query.getMany();

    // Contar por estado
    const pagosPorEstado = Object.values(PaymentStatus).map(estado => {
      const deEstado = pagos.filter(p => p.estado === estado);
      return {
        estado,
        count: deEstado.length,
        monto: deEstado.reduce((sum, p) => sum + Number(p.monto), 0),
      };
    });

    // Agrupar por mes
    const porMes = new Map<string, { count: number; monto: number }>();
    pagos.forEach(p => {
      const mes = p.creadoEn.toISOString().slice(0, 7); // YYYY-MM
      const actual = porMes.get(mes) || { count: 0, monto: 0 };
      actual.count++;
      actual.monto += Number(p.monto);
      porMes.set(mes, actual);
    });

    const pagosPorMes = Array.from(porMes.entries())
      .map(([mes, data]) => ({ mes, ...data }))
      .sort((a, b) => a.mes.localeCompare(b.mes));

    return {
      totalPagos: pagos.length,
      montoTotal: pagos.reduce((sum, p) => sum + Number(p.monto), 0),
      pagosPorEstado,
      pagosPorMes,
    };
  }

  async getPendingCount(): Promise<number> {
    return this.paymentRepo.count({ where: { estado: PaymentStatus.PENDIENTE } });
  }

  async getPendingPayments(): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { estado: PaymentStatus.PENDIENTE },
      relations: ['estudiante', 'estudiante.usuario', 'concepto'],
      order: { creadoEn: 'DESC' },
    });
  }
}
