import { Controller, Post, Body, Get, Patch, Param, Delete } from '@nestjs/common';
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
    return this.packagesService.processInput(
      input,
      person,
      date,
      colecta,
    );
  }
  //eddpoint de edicion

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

//eliminar repetidos
@Delete('duplicates')
removeDuplicates(){
  return this.packagesService.removeDuplicates();
}

// delete 2 borrar paquetes selecionados 
@Delete()
deleteMany(@Body('ids') ids: number[]) {
  if (!ids || ids.length === 0) {
    return { deleted: 0, message: 'No se enviaron IDs' };
  }
  return this.packagesService.deleteMany(ids);
}
  /* =================== OBTENER TODOS =================== */
  @Get()
  getAll() {
    return this.packagesService.findAll();
  }
}
