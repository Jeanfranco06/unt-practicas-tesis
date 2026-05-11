import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CareerService } from '../services/career.service';
// import { CreateCareerDto, UpdateCareerDto } from '../dto/career.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RoleName } from '../../users/entities/role.entity';

@Controller('academic/careers')
@UseGuards(AuthGuard, RolesGuard)
export class CareerController {
  constructor(private readonly careerService: CareerService) {}

  @Post()
  @Roles(RoleName.ADMIN)
  create(@Body() createCareerDto: any) {
    return this.careerService.create(createCareerDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR, RoleName.ASESOR)
  findAll() {
    return this.careerService.findAll();
  }

  // Rutas específicas deben ir antes de rutas parametrizadas
  @Get('first/available')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR, RoleName.ASESOR)
  findFirst() {
    return this.careerService.findFirst();
  }

  @Get('code/:codigo')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR, RoleName.ASESOR)
  findByCode(@Param('codigo') codigo: string) {
    return this.careerService.findByCode(codigo);
  }

  @Get('faculty/:facultyId')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR, RoleName.ASESOR)
  findByFaculty(@Param('facultyId', ParseIntPipe) facultyId: number) {
    return this.careerService.findByFaculty(facultyId);
  }

  // Ruta parametrizada va al final
  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR, RoleName.ASESOR)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.careerService.findById(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCareerDto: any) {
    return this.careerService.update(id, updateCareerDto);
  }

  @Patch(':id/deactivate')
  @Roles(RoleName.ADMIN)
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.careerService.deactivate(id);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.careerService.deactivate(id);
  }
}
