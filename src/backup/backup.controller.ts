import { Controller, Get, Post, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BackupService } from './backup.service';
import { Express } from 'express'; // Asegúrate de tener esto

@Controller('backup')
export class BackupController {
  constructor(private readonly service: BackupService) {}

  @Get('export')
  exportAll() {
    return this.service.exportAll();
  }

  @Get('import-progress')
  getImportProgress() {
    return this.service.getProgress();
  }
@Post('import')
@UseInterceptors(FileInterceptor('file'))
async importAll(@UploadedFile() file: Express.Multer.File) {
  try {
    if (!file) throw new Error("No se recibió el archivo");
    
    // Convertimos el buffer a texto y luego a JSON
    const contenido = file.buffer.toString('utf8');
    const data = JSON.parse(contenido);
    
    return await this.service.importAll(data);
  } catch (error) {
    console.error("❌ ERROR EN IMPORTACIÓN:", error.message);
    throw new HttpException('Error al procesar el JSON: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
}