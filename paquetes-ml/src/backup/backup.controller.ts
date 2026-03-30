import { Controller, Get, Post, Body } from '@nestjs/common';
import { BackupService } from './backup.service';

@Controller('backup')
export class BackupController {
  constructor(private readonly service: BackupService) {}

  @Get('export')
  exportAll() {
    return this.service.exportAll();
  }

  @Post('import')
  importAll(@Body() body: any) {
    return this.service.importAll(body);
  }
}