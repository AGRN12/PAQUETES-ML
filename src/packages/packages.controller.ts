import { Controller, Post, Body, Get, Patch, Param, Delete, Query } from '@nestjs/common';
import { PackagesService } from './packages.service';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  /* =================== PROCESAR PAQUETES =================== */
  @Post('process')
  processInput(
    @Body('input') input: string,
    @Body('person') person: string,
    @Body('date') date: string,
    @Body('colecta') colecta: number,
  ) {
    return this.packagesService.processInput(input, person, date, colecta);
  }

  /* =================== FILTRADO POR MES Y AÑO (PARA TABLA/REPORTES) =================== */
  @Get('filter')
  filterByMonthAndYear(
    @Query('months') months: string, 
    @Query('year') year: string,    
  ) {
    const monthArray = months.split(',').map(m => parseInt(m));
    const yearNum = parseInt(year);
    // IMPORTANTE: El Service ahora devuelve todo el bloque sin límites
    return this.packagesService.findByMonthsAndYear(monthArray, yearNum);
  }

  /* =================== REPORTE POR DÍA (PARA IMPRIMIR) =================== */
  @Get('report-day')
  getDayReport(
    @Query('date') date: string,
    @Query('colecta') colecta: string,
  ) {
    // Este método en el Service te traerá todo el día completo sin paginación
    return this.packagesService.findForReport(date, colecta);
  }

  /* =================== EDICIÓN =================== */
  @Patch(':id')
  updatePackage(
    @Param('id') id: number,
    @Body() body: {
      code: string;
      type: 'DROP_OFF' | 'DEVOLUCION' | 'PICK_UP';
      person: string;
      colecta: number;
      date: string;
    },
  ) {
    return this.packagesService.updatePackage(id, body);
  }

  /* =================== ELIMINACIÓN =================== */

  @Delete('duplicates')
  removeDuplicates() {
    return this.packagesService.removeDuplicates();
  }

  @Delete()
  deleteMany(@Body('ids') ids: number[]) {
    if (!ids || ids.length === 0) return { deleted: 0, message: 'No se enviaron IDs' };
    return this.packagesService.deleteMany(ids);
  }

  // Borrar meses seleccionados (Limpieza masiva)
  @Delete('filter-clean')
  async deleteFiltered(
    @Body('months') months: number[],
    @Body('year') year: number,
  ) {
    // Aquí usamos la función corregida del Service para borrar de verdad
    return this.packagesService.deleteByMonthsAndYear(months, year);
  }

  /* =================== NAVEGACIÓN Y BÚSQUEDA (CON PAGINACIÓN) =================== */
  @Get()
  getAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('search') search?: string
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    return this.packagesService.findAll(pageNum, limitNum, search);
  }
}