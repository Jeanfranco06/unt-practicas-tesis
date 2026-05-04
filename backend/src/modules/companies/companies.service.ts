import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Company } from './entities/company.entity';
import { CompanyRepresentative } from './entities/company-representative.entity';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company) private companyRepo: Repository<Company>,
    @InjectRepository(CompanyRepresentative) private representativeRepo: Repository<CompanyRepresentative>,
  ) {}

  async findAll(incluirInactivas = false): Promise<Company[]> {
    const where: any = {};
    if (!incluirInactivas) {
      where.activo = true;
    }
    return this.companyRepo.find({ where });
  }

  async findById(id: number): Promise<Company> {
    const company = await this.companyRepo.findOne({ where: { id } });
    if (!company) throw new NotFoundException('Empresa no encontrada');
    return company;
  }

  async findByRuc(ruc: string): Promise<Company | null> {
    return this.companyRepo.findOneBy({ ruc });
  }

  async create(createDto: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepo.create(createDto);
    return this.companyRepo.save(company);
  }

  async update(id: number, updateDto: UpdateCompanyDto): Promise<Company> {
    // RUC is immutable — strip it from updates to prevent modification
    const { ruc, ...safeDto } = updateDto as any;
    await this.companyRepo.update(id, safeDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.companyRepo.update(id, { activo: false });
  }

  async getActiveAgreementsCount(): Promise<number> {
    return 0; // placeholder
  }

  async findAllWithoutRepresentative(incluirInactivas = false): Promise<Company[]> {
    // Obtener todas las empresas
    const where: any = {};
    if (!incluirInactivas) {
      where.activo = true;
    }
    const companies = await this.companyRepo.find({ where });

    if (companies.length === 0) {
      return [];
    }

    // Obtener IDs de todas las empresas
    const companyIds = companies.map(c => c.id);

    // Buscar representantes activos para estas empresas
    const representatives = await this.representativeRepo.find({
      where: { empresaId: In(companyIds) },
      relations: ['usuario'],
    });

    // Crear set de IDs de empresas que tienen representantes activos
    const empresaIdsConRepresentantes = new Set(
      representatives
        .filter(r => r.usuario?.activo !== false)
        .map(r => r.empresaId)
    );

    // Filtrar empresas que no tienen representantes activos
    return companies.filter(c => !empresaIdsConRepresentantes.has(c.id));
  }
}