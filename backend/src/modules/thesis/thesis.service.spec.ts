import { ThesisService } from './thesis.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ThesisProject, ThesisEstado } from './entities/thesis-project.entity';
import { BadRequestException } from '@nestjs/common';

describe('ThesisService', () => {
  let service: ThesisService;
  let projectRepo: any;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ThesisService,
        { provide: getRepositoryToken(ThesisProject), useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), update: jest.fn() } },
        // otros repositorios mockeados...
      ],
    }).compile();
    service = module.get(ThesisService);
    projectRepo = module.get(getRepositoryToken(ThesisProject));
  });

  it('debería crear un proyecto de tesis', async () => {
    const dto = { estudianteId: 1, titulo: 'Tesis UNT', resumen: 'Resumen', areaConocimiento: 'Ingeniería' };
    projectRepo.create.mockReturnValue({ id: 1, ...dto });
    projectRepo.save.mockResolvedValue({ id: 1 });
    const result = await service.createProject(dto);
    expect(result).toHaveProperty('id', 1);
  });

  it('debería impedir transiciones de estado inválidas', () => {
    const from = ThesisEstado.PROPUESTO;
    const to = ThesisEstado.EN_DESARROLLO;
    // método privado canTransition, pero se prueba a través de updateProject
    // Simulamos que existe un proyecto y se intenta cambiar de estado inválido
    projectRepo.findOne.mockResolvedValue({ id: 1, estado: ThesisEstado.APROBADO });
    // Intentar pasar de APROBADO a PROPUESTO es inválido
    expect(service.updateProject(1, { estado: ThesisEstado.PROPUESTO })).rejects.toThrow(BadRequestException);
  });
});