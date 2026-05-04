import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyRepresentative } from '../entities/company-representative.entity';

@Injectable()
export class CompanyRepresentativeService {
  constructor(
    @InjectRepository(CompanyRepresentative)
    private readonly representativeRepository: Repository<CompanyRepresentative>,
  ) {}

  async findAll(incluirInactivos = false): Promise<CompanyRepresentative[]> {
    const where: any = {};
    if (!incluirInactivos) {
      // Necesitamos cargar el usuario para verificar si está activo
    }
    return this.representativeRepository.find({
      relations: ['usuario', 'empresa'],
    });
  }

  async findById(id: number): Promise<CompanyRepresentative> {
    const representative = await this.representativeRepository.findOne({
      where: { id },
      relations: ['usuario', 'empresa'],
    });
    if (!representative) throw new NotFoundException('Representante no encontrado');
    return representative;
  }

  async findByCompany(empresaId: number): Promise<CompanyRepresentative[]> {
    return this.representativeRepository.find({
      where: { empresaId },
      relations: ['usuario', 'empresa'],
    });
  }

  async findByUser(usuarioId: number): Promise<CompanyRepresentative | null> {
    return this.representativeRepository.findOne({
      where: { usuarioId },
      relations: ['usuario', 'empresa'],
    });
  }

  async create(data: Partial<CompanyRepresentative>): Promise<CompanyRepresentative> {
    const representative = this.representativeRepository.create(data);
    return this.representativeRepository.save(representative);
  }

  async update(id: number, data: Partial<CompanyRepresentative>): Promise<CompanyRepresentative> {
    const representative = await this.findById(id);
    Object.assign(representative, data);
    return this.representativeRepository.save(representative);
  }

  async remove(id: number): Promise<void> {
    const representative = await this.findById(id);
    // Soft delete: marcar como inactivo en el usuario relacionado
    if (representative.usuario) {
      representative.usuario.activo = false;
    }
    await this.representativeRepository.save(representative);
  }

  async activate(id: number): Promise<CompanyRepresentative> {
    const representative = await this.findById(id);
    if (representative.usuario) {
      representative.usuario.activo = true;
    }
    return this.representativeRepository.save(representative);
  }
}
