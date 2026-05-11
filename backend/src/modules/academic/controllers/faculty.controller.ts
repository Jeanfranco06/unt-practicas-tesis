import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FacultyService } from '../services/faculty.service';
// DTO imports will be fixed when DTO files are properly created
// import { CreateFacultyDto, UpdateFacultyDto } from '../dto/faculty.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RoleName } from '../../users/entities/role.entity';

@Controller('academic/faculties')
@UseGuards(AuthGuard, RolesGuard)
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Post()
  @Roles(RoleName.ADMIN)
  create(@Body() createFacultyDto: any) {
    return this.facultyService.create(createFacultyDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR, RoleName.ASESOR)
  findAll() {
    return this.facultyService.findAll();
  }

  // Rutas específicas deben ir antes de rutas parametrizadas
  @Get('code/:codigo')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR, RoleName.ASESOR)
  findByCode(@Param('codigo') codigo: string) {
    return this.facultyService.findByCode(codigo);
  }

  // Ruta parametrizada va al final
  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR, RoleName.ASESOR)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facultyService.findById(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFacultyDto: any) {
    return this.facultyService.update(id, updateFacultyDto);
  }

  @Patch(':id/deactivate')
  @Roles(RoleName.ADMIN)
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.facultyService.deactivate(id);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.facultyService.deactivate(id);
  }
}
