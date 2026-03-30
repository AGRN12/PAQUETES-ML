import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PasswordsService } from './passwords.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('passwords')
export class PasswordsController {
  constructor(private readonly service: PasswordsService) {}

  // ✅ ADMIN Y USER
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  // ✅ ADMIN Y USER
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // ✅ ADMIN Y USER
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(Number(id), body);
  }

  // ❌ SOLO ADMIN
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.delete(Number(id));
  }

  // ❌ SOLO ADMIN
  @Roles('admin')
  @Get('export')
  exportData() {
    return this.service.exportData();
  }

  // ❌ SOLO ADMIN
  @Roles('admin')
  @Post('import')
  importData(@Body() data: any[]) {
    return this.service.importData(data);
  }
}