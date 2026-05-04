import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agreement, EstadoConvenio, calcularEstadoConvenio, normalizarEstadoConvenio } from './entities/agreement.entity';
import { CreateAgreementDto, UpdateAgreementDto } from './dto/agreement.dto';
import { CompaniesService } from '../companies/companies.service';
import * as path from 'path';

@Injectable()
export class AgreementsService {
  constructor(
    @InjectRepository(Agreement) private agreementRepo: Repository<Agreement>,
    private companiesService: CompaniesService,
  ) {}

  async findAll(): Promise<Agreement[]> {
    return this.agreementRepo.find({ relations: ['empresa'] });
  }

  async findById(id: number): Promise<Agreement> {
    const agreement = await this.agreementRepo.findOne({ where: { id }, relations: ['empresa'] });
    if (!agreement) throw new NotFoundException('Convenio no encontrado');
    return agreement;
  }

  async findByEmpresa(empresaId: number): Promise<Agreement[]> {
    return this.agreementRepo.find({ where: { empresaId }, relations: ['empresa'] });
  }

  async create(createDto: CreateAgreementDto): Promise<Agreement> {
    await this.companiesService.findById(createDto.empresaId);
    
    // Validar que objeto/objetoContrato tenga valor
    const objetoValue = (createDto as any).objetoContrato || (createDto as any).objeto;
    if (!objetoValue || objetoValue.trim() === '') {
      throw new BadRequestException('El campo objetoContrato es requerido');
    }
    
    // Verificar si ya existe un convenio vigente (por fecha) del mismo tipo con la misma empresa
    const existingAgreements = await this.agreementRepo.find({
      where: { 
        empresaId: createDto.empresaId, 
        tipo: createDto.tipo,
        // No filtrar por estado, verificaremos la fecha manualmente
      },
    });
    
    // Filtrar solo los que están realmente vigentes (por fecha, no cancelados)
    const vigentesReales = existingAgreements.filter(a => 
      normalizarEstadoConvenio(a.estado, a.fechaVencimiento) === EstadoConvenio.VIGENTE
    );
    
    if (vigentesReales.length > 0) {
      throw new BadRequestException(
        `Ya existe un convenio ${createDto.tipo} vigente con esta empresa. ` +
        `Puede renovar el convenio existente o crear uno de tipo diferente.`
      );
    }
    
    // Mapear objetoContrato a objeto para la entidad
    const agreementData = {
      empresaId: createDto.empresaId,
      tipo: createDto.tipo,
      objeto: objetoValue,
      fechaInicio: createDto.fechaInicio,
      fechaVencimiento: createDto.fechaVencimiento,
      estado: createDto.estado,
      // Si hay archivo subido, usar el path generado por multer diskStorage
      documentoUrl: createDto.documentoFile?.path 
        ? `/uploads/convenios/${path.basename(createDto.documentoFile.path)}`
        : createDto.documentoUrl,
    };
    
    const agreements = this.agreementRepo.create(agreementData as any);
    const agreement = Array.isArray(agreements) ? agreements[0] : agreements;
    
    return this.agreementRepo.save(agreement);
  }

  async update(id: number, updateDto: UpdateAgreementDto): Promise<Agreement> {
    const agreement = await this.findById(id);
    if (updateDto.empresaId && updateDto.empresaId !== agreement.empresaId) {
      await this.companiesService.findById(updateDto.empresaId);
    }
    
    // Mapear objetoContrato a objeto para la entidad si existe
    const updateData: any = { };
    if ((updateDto as any).objetoContrato !== undefined) {
      updateData.objeto = (updateDto as any).objetoContrato;
    }
    if (updateDto.empresaId) updateData.empresaId = updateDto.empresaId;
    if (updateDto.tipo) updateData.tipo = updateDto.tipo;
    if (updateDto.fechaInicio) updateData.fechaInicio = updateDto.fechaInicio;
    if (updateDto.fechaVencimiento) updateData.fechaVencimiento = updateDto.fechaVencimiento;
    if (updateDto.estado) updateData.estado = updateDto.estado;
    
    // Manejar documento subido - multer diskStorage ya guardó el archivo
    if ((updateDto as any).documentoFile?.path) {
      updateData.documentoUrl = `/uploads/convenios/${path.basename((updateDto as any).documentoFile.path)}`;
    } else if (updateDto.documentoUrl !== undefined) {
      updateData.documentoUrl = updateDto.documentoUrl;
    }
    
    if (Object.keys(updateData).length > 0) {
      await this.agreementRepo.update(id, updateData);
    }
    return this.findById(id);
  }

  async remove(id: number): Promise<{ message: string; estado: string }> {
    // Soft delete: cambiar estado a CANCELADO en lugar de eliminar físicamente
    await this.agreementRepo.update(id, { estado: EstadoConvenio.CANCELADO });
    return { message: 'Convenio eliminado exitosamente', estado: EstadoConvenio.CANCELADO };
  }

  async renewAgreement(id: number, newFechaVencimiento: string): Promise<Agreement> {
    const agreement = await this.findById(id);
    // Al renovar, el convenio vuelve a estar vigente con la nueva fecha
    await this.agreementRepo.update(id, { 
      fechaVencimiento: new Date(newFechaVencimiento), 
      estado: EstadoConvenio.VIGENTE 
    });
    return this.findById(id);
  }

  // Método para sincronizar todos los estados basados en fechas (ejecutar periódicamente)
  async sincronizarEstados(): Promise<{ actualizados: number; detalles: string[] }> {
    const convenios = await this.agreementRepo.find();
    let actualizados = 0;
    const detalles: string[] = [];
    
    for (const convenio of convenios) {
      const estadoReal = normalizarEstadoConvenio(convenio.estado, convenio.fechaVencimiento);
      // Solo actualizar si el estado almacenado es diferente al estado real calculado
      // y no es cancelado (los cancelados se respetan)
      if (estadoReal !== convenio.estado) {
        await this.agreementRepo.update(convenio.id, { estado: estadoReal });
        actualizados++;
        detalles.push(`Convenio ${convenio.id}: ${convenio.estado} → ${estadoReal}`);
      }
    }
    
    return { actualizados, detalles };
  }

  // Obtener el estado real calculado (considerando la fecha actual y normalizando estados antiguos)
  getEstadoReal(agreement: Agreement): EstadoConvenio {
    return normalizarEstadoConvenio(agreement.estado, agreement.fechaVencimiento);
  }

  async countActive(): Promise<number> {
    // Contar convenios vigentes basado en fecha (excluyendo cancelados)
    const convenios = await this.agreementRepo.find();
    return convenios.filter(c => 
      normalizarEstadoConvenio(c.estado, c.fechaVencimiento) === EstadoConvenio.VIGENTE
    ).length;
  }
}