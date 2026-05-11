import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto, UpdatePaymentStatusDto, RejectPaymentDto } from './dto/update-payment.dto';
import { PaymentFiltersDto } from './dto/payment-filters.dto';
import { CreatePaymentConceptDto, UpdatePaymentConceptDto } from './dto/payment-concept.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '../users/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaymentStatus } from './entities/payment.entity';

@Controller('payments')
@UseGuards(AuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ============ CONCEPTOS DE PAGO ============

  @Post('concepts')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.SECRETARIA)
  async createConcept(@Body() dto: CreatePaymentConceptDto) {
    const concept = await this.paymentsService.createConcept(dto);
    return { message: 'Concepto de pago creado exitosamente', data: concept };
  }

  @Get('concepts')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.SECRETARIA, RolUsuario.ESTUDIANTE)
  async findAllConcepts(@Query('activo') activo?: string) {
    const activoBool = activo === 'true' ? true : activo === 'false' ? false : undefined;
    const concepts = await this.paymentsService.findAllConcepts(activoBool);
    return { data: concepts };
  }

  @Get('concepts/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.SECRETARIA, RolUsuario.ESTUDIANTE)
  async findConceptById(@Param('id', ParseIntPipe) id: number) {
    const concept = await this.paymentsService.findConceptById(id);
    return { data: concept };
  }

  @Patch('concepts/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.SECRETARIA)
  async updateConcept(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentConceptDto,
  ) {
    const concept = await this.paymentsService.updateConcept(id, dto);
    return { message: 'Concepto de pago actualizado exitosamente', data: concept };
  }

  @Delete('concepts/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.SECRETARIA)
  async deleteConcept(@Param('id', ParseIntPipe) id: number) {
    await this.paymentsService.deleteConcept(id);
    return { message: 'Concepto de pago eliminado exitosamente' };
  }

  // ============ PAGOS ============

  @Post()
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.SECRETARIA)
  async create(
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: any,
  ) {
    const payment = await this.paymentsService.create(dto, user.sub);
    return { message: 'Pago registrado exitosamente', data: payment };
  }

  @Get('stats')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.SECRETARIA)
  async getStats(
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    const desde = fechaDesde ? new Date(fechaDesde) : undefined;
    const hasta = fechaHasta ? new Date(fechaHasta) : undefined;
    return this.paymentsService.getStats(desde, hasta);
  }

  @Get('pending')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.SECRETARIA)
  async getPendingPayments() {
    const [payments, count] = await Promise.all([
      this.paymentsService.getPendingPayments(),
      this.paymentsService.getPendingCount(),
    ]);
    return { data: payments, pendingCount: count };
  }

  @Get('my-payments')
  @Roles(RolUsuario.ESTUDIANTE)
  async getMyPayments(@CurrentUser() user: any) {
    // El estudiante debe tener un studentId asociado
    if (!user.studentId) {
      throw new NotFoundException('Perfil de estudiante no encontrado');
    }
    const payments = await this.paymentsService.findByStudent(user.studentId);
    return { data: payments };
  }

  @Get('by-code/:codigo')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.SECRETARIA)
  async findByCode(@Param('codigo') codigo: string) {
    const payment = await this.paymentsService.findByCode(codigo);
    return { data: payment };
  }

  @Get('student/:estudianteId')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.SECRETARIA, RolUsuario.ESTUDIANTE)
  async findByStudent(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @CurrentUser() user: any,
  ) {
    // Si es estudiante, solo puede ver sus propios pagos
    if (user.rol === RolUsuario.ESTUDIANTE && user.studentId !== estudianteId) {
      throw new NotFoundException('No tiene permiso para ver estos pagos');
    }
    
    const payments = await this.paymentsService.findByStudent(estudianteId);
    return { data: payments };
  }

  @Get()
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.SECRETARIA)
  async findAll(
    @Query() filters: PaymentFiltersDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.paymentsService.findAll(filters, page, limit);
  }

  @Get(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.SECRETARIA, RolUsuario.ESTUDIANTE)
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const payment = await this.paymentsService.findById(id);
    
    // Si es estudiante, verificar que sea su propio pago
    if (user.rol === RolUsuario.ESTUDIANTE && payment.estudianteId !== user.studentId) {
      throw new NotFoundException('Pago no encontrado');
    }
    
    return { data: payment };
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.SECRETARIA)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentDto,
  ) {
    const payment = await this.paymentsService.update(id, dto);
    return { message: 'Pago actualizado exitosamente', data: payment };
  }

  @Patch(':id/status')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.SECRETARIA)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentStatusDto,
    @CurrentUser() user: any,
  ) {
    const payment = await this.paymentsService.updateStatus(id, dto, user.sub);
    return { message: 'Estado del pago actualizado exitosamente', data: payment };
  }

  @Post(':id/approve')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.SECRETARIA)
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const payment = await this.paymentsService.approve(id, user.sub);
    return { message: 'Pago aprobado exitosamente', data: payment };
  }

  @Post(':id/reject')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.SECRETARIA)
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectPaymentDto,
    @CurrentUser() user: any,
  ) {
    const payment = await this.paymentsService.reject(id, dto.motivo, user.sub);
    return { message: 'Pago rechazado', data: payment };
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.paymentsService.delete(id);
    return { message: 'Pago eliminado exitosamente' };
  }
}
