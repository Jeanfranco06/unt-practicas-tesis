import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';

@Injectable()
export class CompaniesService {
  constructor(@InjectRepository(Company) private companyRepo: Repository<Company>) {}

  async findAll(): Promise<Company[]> {
    return this.companyRepo.find({ relations: ['convenios'] });
  }

  async findById(id: number): Promise<Company> {
    const company = await this.companyRepo.findOne({ where: { id }, relations: ['convenios'] });
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
    await this.companyRepo.update(id, updateDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.companyRepo.delete(id);
  }

  // src/modules/companies/companies.service.ts (agregar)

async getActiveAgreementsCount(): Promise<number> {
  return this.agreementRepo.count({ where: { estado: EstadoConvenio.VIGENTE } });
}
}