import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AgreementsService } from './agreements.service';
import { CreateAgreementDto, UpdateAgreementDto } from './dto/agreement.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '../users/entities/user.entity';

@Controller('agreements')
@UseGuards(AuthGuard, RolesGuard)
export class AgreementsController {
  constructor(private readonly agreementsService: AgreementsService) {}

  @Get()
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  findAll() {
    return this.agreementsService.findAll();
  }

  @Get('company/:empresaId')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.REPRESENTANTE_EMPRESA)
  findByCompany(@Param('empresaId') empresaId: string) {
    return this.agreementsService.findByEmpresa(+empresaId);
  }

  @Get(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  findOne(@Param('id') id: string) {
    return this.agreementsService.findById(+id);
  }

  @Post()
  @Roles(RolUsuario.ADMIN)
  create(@Body() createAgreementDto: CreateAgreementDto) {
    return this.agreementsService.create(createAgreementDto);
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMIN)
  update(@Param('id') id: string, @Body() updateAgreementDto: UpdateAgreementDto) {
    return this.agreementsService.update(+id, updateAgreementDto);
  }

  @Patch(':id/renew')
  @Roles(RolUsuario.ADMIN)
  renew(@Param('id') id: string, @Body('nuevaFecha') nuevaFecha: string) {
    return this.agreementsService.renewAgreement(+id, nuevaFecha);
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMIN)
  remove(@Param('id') id: string) {
    return this.agreementsService.remove(+id);
  }
}