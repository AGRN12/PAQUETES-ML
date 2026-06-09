import {
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express'; // 👈 correcto con import type
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('user')
@UseGuards(JwtAuthGuard,)
@Roles('ADMIN')
export class AdminController {

  // =========================
  // EXPORTAR BASE DE DATOS
  // =========================
  @Get('export-db')
  exportDB(@Res() res: Response) {
    const dbPath = path.join(process.cwd(), 'paquetes.db');

    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({
        message: 'Base de datos no encontrada',
      });
    }

    return res.download(dbPath, 'paquetes-backup.db');
  }

  // =========================
  // IMPORTAR BASE DE DATOS
  // =========================
  @Post('import-db')
  @UseInterceptors(FileInterceptor('file'))
  importDB(
    @UploadedFile() file: any,
    @Res() res: Response,
  ) {
    if (!file) {
      return res.status(400).json({
        message: 'No se envió ningún archivo',
      });
    }

    const dbPath = path.join(process.cwd(), 'paquetes.db');

    try {
      // Reemplaza la base de datos
      fs.writeFileSync(dbPath, file.buffer);

      return res.json({
        message: 'Base de datos importada correctamente. Reinicia el servidor.',
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error al importar la base de datos',
      });
    }
  }
}
