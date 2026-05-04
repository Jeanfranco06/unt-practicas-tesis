import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ForbiddenException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompanyRepresentativeService } from './services/company-representative.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolUsuario } from '../users/entities/user.entity';

@Controller('companies')
@UseGuards(AuthGuard, RolesGuard)
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly companyRepresentativeService: CompanyRepresentativeService,
  ) {}

  @Get()
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  findAll(@Query('incluirInactivas') incluirInactivas?: string) {
    return this.companiesService.findAll(incluirInactivas === 'true');
  }

  @Get('available/representative')
  @Roles(RolUsuario.ADMIN)
  findAllWithoutRepresentative(@Query('incluirInactivas') incluirInactivas?: string) {
    return this.companiesService.findAllWithoutRepresentative(incluirInactivas === 'true');
  }

  @Get(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.REPRESENTANTE_EMPRESA)
  findOne(@Param('id') id: string) {
    return this.companiesService.findById(+id);
  }

  @Post()
  @Roles(RolUsuario.ADMIN)
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.REPRESENTANTE_EMPRESA)
  async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto, @CurrentUser() user: any) {
    const isRepresentante = user.rol === RolUsuario.REPRESENTANTE_EMPRESA ||
      (user.roles && user.roles.includes(RolUsuario.REPRESENTANTE_EMPRESA));
    if (isRepresentante) {
      const rep = await this.companyRepresentativeService.findByUser(user.sub || user.id);
      if (!rep || rep.empresaId !== +id) {
        throw new ForbiddenException('Solo puede modificar los datos de su propia empresa');
      }
    }
    return this.companiesService.update(+id, updateCompanyDto);
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMIN)
  remove(@Param('id') id: string) {
    return this.companiesService.remove(+id);
  }
}