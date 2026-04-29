import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agreement, EstadoConvenio } from './entities/agreement.entity';
import { CreateAgreementDto, UpdateAgreementDto } from './dto/agreement.dto';
import { CompaniesService } from '../companies/companies.service';

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
    const agreement = this.agreementRepo.create(createDto);
    return this.agreementRepo.save(agreement);
  }

  async update(id: number, updateDto: UpdateAgreementDto): Promise<Agreement> {
    const agreement = await this.findById(id);
    if (updateDto.empresaId && updateDto.empresaId !== agreement.empresaId) {
      await this.companiesService.findById(updateDto.empresaId);
    }
    await this.agreementRepo.update(id, updateDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.agreementRepo.delete(id);
  }

  async renewAgreement(id: number, newFechaVencimiento: string): Promise<Agreement> {
    const agreement = await this.findById(id);
    if (agreement.estado !== EstadoConvenio.VIGENTE && agreement.estado !== EstadoConvenio.VENCIDO) {
      throw new BadRequestException('Solo se pueden renovar convenios vigentes o vencidos');
    }
    await this.agreementRepo.update(id, { fechaVencimiento: new Date(newFechaVencimiento), estado: EstadoConvenio.RENOVADO });
    return this.findById(id);
  }
}