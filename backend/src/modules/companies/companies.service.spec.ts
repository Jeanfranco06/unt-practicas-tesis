import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';
import { CompanyRepresentative } from './entities/company-representative.entity';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let companyRepo: jest.Mocked<Repository<Company>>;
  let representativeRepo: jest.Mocked<Repository<CompanyRepresentative>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: getRepositoryToken(Company),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CompanyRepresentative),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    companyRepo = module.get(getRepositoryToken(Company));
    representativeRepo = module.get(getRepositoryToken(CompanyRepresentative));
  });

  describe('findAllWithoutRepresentative', () => {
    it('should return companies without active representatives', async () => {
      const mockCompanies: Company[] = [
        { id: 1, razonSocial: 'Empresa 1', activo: true } as Company,
        { id: 2, razonSocial: 'Empresa 2', activo: true } as Company,
        { id: 3, razonSocial: 'Empresa 3', activo: true } as Company,
      ];

      const mockRepresentatives: CompanyRepresentative[] = [
        { 
          id: 1, 
          empresaId: 1, 
          usuarioId: 1,
          usuario: { id: 1, activo: true }
        } as CompanyRepresentative,
      ];

      companyRepo.find.mockResolvedValue(mockCompanies);
      representativeRepo.find.mockResolvedValue(mockRepresentatives);

      const result = await service.findAllWithoutRepresentative();

      // Should return only companies 2 and 3 (company 1 has active representative)
      expect(result).toHaveLength(2);
      expect(result.map(c => c.id)).toContain(2);
      expect(result.map(c => c.id)).toContain(3);
      expect(result.map(c => c.id)).not.toContain(1);
    });

    it('should return empty array when all companies have representatives', async () => {
      const mockCompanies: Company[] = [
        { id: 1, razonSocial: 'Empresa 1', activo: true } as Company,
      ];

      const mockRepresentatives: CompanyRepresentative[] = [
        { 
          id: 1, 
          empresaId: 1, 
          usuarioId: 1,
          usuario: { id: 1, activo: true }
        } as CompanyRepresentative,
      ];

      companyRepo.find.mockResolvedValue(mockCompanies);
      representativeRepo.find.mockResolvedValue(mockRepresentatives);

      const result = await service.findAllWithoutRepresentative();

      expect(result).toHaveLength(0);
    });

    it('should include companies with inactive representatives', async () => {
      const mockCompanies: Company[] = [
        { id: 1, razonSocial: 'Empresa 1', activo: true } as Company,
      ];

      // Representative exists but is inactive
      const mockRepresentatives: CompanyRepresentative[] = [
        { 
          id: 1, 
          empresaId: 1, 
          usuarioId: 1,
          usuario: { id: 1, activo: false }
        } as CompanyRepresentative,
      ];

      companyRepo.find.mockResolvedValue(mockCompanies);
      representativeRepo.find.mockResolvedValue(mockRepresentatives);

      const result = await service.findAllWithoutRepresentative();

      // Should include because representative is inactive
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('should include inactive companies when incluirInactivas is true', async () => {
      const mockCompanies: Company[] = [
        { id: 1, razonSocial: 'Empresa Activa', activo: true } as Company,
        { id: 2, razonSocial: 'Empresa Inactiva', activo: false } as Company,
      ];

      companyRepo.find.mockResolvedValue(mockCompanies);
      representativeRepo.find.mockResolvedValue([]);

      const result = await service.findAllWithoutRepresentative(true);

      expect(result).toHaveLength(2);
      expect(result.map(c => c.id)).toContain(1);
      expect(result.map(c => c.id)).toContain(2);
    });

    it('should return empty array when no companies exist', async () => {
      companyRepo.find.mockResolvedValue([]);

      const result = await service.findAllWithoutRepresentative();

      expect(result).toHaveLength(0);
      expect(representativeRepo.find).not.toHaveBeenCalled();
    });
  });
});
