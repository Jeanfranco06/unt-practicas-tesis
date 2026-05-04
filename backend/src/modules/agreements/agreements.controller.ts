import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { Request } from 'express';
import { AgreementsService } from './agreements.service';
import { CreateAgreementDto, UpdateAgreementDto } from './dto/agreement.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '../users/entities/user.entity';

// Configuración de almacenamiento en disco para Multer
const multerStorage = diskStorage({
  destination: path.join(process.cwd(), 'upload', 'convenios'),
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname
      .replace(/\s+/g, '_')
      .replace(/[()]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .toLowerCase();
    cb(null, `${uniqueSuffix}_${sanitizedName}`);
  },
});

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
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  @UseInterceptors(FileInterceptor('documento', { storage: multerStorage }))
  create(
    @Body() createAgreementDto: CreateAgreementDto,
    @UploadedFile() file: any,
  ) {
    // Si hay archivo, el path ya está configurado por multer diskStorage
    if (file) {
      (createAgreementDto as any).documentoFile = file;
    }
    return this.agreementsService.create(createAgreementDto);
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  @UseInterceptors(FileInterceptor('documento', { storage: multerStorage }))
  update(
    @Param('id') id: string,
    @Body() updateAgreementDto: UpdateAgreementDto,
    @UploadedFile() file: any,
  ) {
    // Si hay archivo, el path ya está configurado por multer diskStorage
    if (file) {
      (updateAgreementDto as any).documentoFile = file;
    }
    return this.agreementsService.update(+id, updateAgreementDto);
  }

  @Patch(':id/renew')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  renew(@Param('id') id: string, @Body('nuevaFecha') nuevaFecha: string) {
    return this.agreementsService.renewAgreement(+id, nuevaFecha);
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  remove(@Param('id') id: string) {
    return this.agreementsService.remove(+id);
  }

  @Post('sync-estados')
  @Roles(RolUsuario.ADMIN)
  async sincronizarEstados() {
    return this.agreementsService.sincronizarEstados();
  }
}