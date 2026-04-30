import { Test, TestingModule } from '@nestjs/testing';
import { InternshipsService } from './internships.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternshipOffer, OfertaEstado } from './entities/internship-offer.entity';
import { InternshipApplication, ApplicationEstado } from './entities/internship-application.entity';
import { Internship } from './entities/internship.entity';
import { HoursTracking } from './entities/hours-tracking.entity';
import { InternshipReport } from './entities/internship-report.entity';
import { FinalEvaluation } from './entities/final-evaluation.entity';
import { CompaniesService } from '../companies/companies.service';
import { StudentsService } from '../students/students.service';
import { UsersService } from '../users/users.service';
import { AgreementsService } from '../agreements/agreements.service';
import { BadRequestException } from '@nestjs/common';

describe('InternshipsService', () => {
  let service: InternshipsService;
  let offerRepo: any;
  let appRepo: any;
  let internshipRepo: any;

  const mockRepository = () => ({
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
  });

  const mockOffer = {
    id: 1,
    empresaId: 10,
    titulo: 'Practica en TI',
    requisitos: 'Conocimientos',
    fechaInicioPostulacion: new Date('2025-01-01'),
    fechaFinPostulacion: new Date('2025-01-31'),
    fechaInicioPractica: new Date('2025-02-01'),
    fechaFinPractica: new Date('2025-04-30'),
    cupos: 2,
    estado: OfertaEstado.PUBLICADA,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InternshipsService,
        { provide: getRepositoryToken(InternshipOffer), useValue: mockRepository() },
        { provide: getRepositoryToken(InternshipApplication), useValue: mockRepository() },
        { provide: getRepositoryToken(Internship), useValue: mockRepository() },
        { provide: getRepositoryToken(HoursTracking), useValue: mockRepository() },
        { provide: getRepositoryToken(InternshipReport), useValue: mockRepository() },
        { provide: getRepositoryToken(FinalEvaluation), useValue: mockRepository() },
        { provide: CompaniesService, useValue: { findById: jest.fn().mockResolvedValue(true) } },
        { provide: StudentsService, useValue: { findById: jest.fn().mockResolvedValue(true) } },
        { provide: UsersService, useValue: { findById: jest.fn().mockResolvedValue(true) } },
        { provide: AgreementsService, useValue: { findById: jest.fn().mockResolvedValue(true) } },
      ],
    }).compile();

    service = module.get<InternshipsService>(InternshipsService);
    offerRepo = module.get(getRepositoryToken(InternshipOffer));
    appRepo = module.get(getRepositoryToken(InternshipApplication));
    internshipRepo = module.get(getRepositoryToken(Internship));
  });

  describe('apply', () => {
    it('debería crear una postulación si la oferta está activa y dentro del período', async () => {
      const now = new Date('2025-01-15');
      jest.useFakeTimers().setSystemTime(now);
      offerRepo.findOne.mockResolvedValue(mockOffer);
      appRepo.findOneBy.mockResolvedValue(null);
      appRepo.create.mockReturnValue({ id: 100 });
      appRepo.save.mockResolvedValue({ id: 100 });

      const result = await service.apply({ ofertaId: 1, estudianteId: 99, documentoCvUrl: 'http://cv.pdf' });
      expect(result).toEqual({ id: 100 });
      expect(appRepo.create).toHaveBeenCalledWith(expect.objectContaining({ ofertaId: 1, estudianteId: 99 }));
    });

    it('debería lanzar error si la oferta no está publicada', async () => {
      offerRepo.findOne.mockResolvedValue({ ...mockOffer, estado: OfertaEstado.BORRADOR });
      await expect(service.apply({ ofertaId: 1, estudianteId: 99 })).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar error si ya postuló', async () => {
      offerRepo.findOne.mockResolvedValue(mockOffer);
      appRepo.findOneBy.mockResolvedValue({ id: 200 });
      await expect(service.apply({ ofertaId: 1, estudianteId: 99 })).rejects.toThrow(BadRequestException);
    });
  });
});