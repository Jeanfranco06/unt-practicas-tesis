import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { CompanyRepresentativeService } from '../services/company-representative.service';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RoleName } from '../../users/entities/role.entity';

@Controller('company-representatives')
@UseGuards(AuthGuard, RolesGuard)
export class CompanyRepresentativeController {
  constructor(private readonly representativeService: CompanyRepresentativeService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR)
  findAll(@Query('incluirInactivos') incluirInactivos?: string) {
    return this.representativeService.findAll(incluirInactivos === 'true');
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR, RoleName.REPRESENTANTE_EMPRESA)
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.representativeService.findById(id);
  }

  @Get('company/:empresaId')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR)
  findByCompany(@Param('empresaId', ParseIntPipe) empresaId: number) {
    return this.representativeService.findByCompany(empresaId);
  }

  @Get('user/:usuarioId')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR, RoleName.REPRESENTANTE_EMPRESA)
  findByUser(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.representativeService.findByUser(usuarioId);
  }

  @Post()
  @Roles(RoleName.ADMIN)
  create(@Body() createDto: any) {
    return this.representativeService.create(createDto);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: any) {
    return this.representativeService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.representativeService.remove(id);
  }

  @Patch(':id/activate')
  @Roles(RoleName.ADMIN)
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.representativeService.activate(id);
  }
}
