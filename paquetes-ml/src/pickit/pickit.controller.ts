import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PickitService } from './pickit.service';

@Controller('pickit')
export class PickitController {
  constructor(private readonly pickitService: PickitService) {}

  /* =================== CREAR =================== */
@Post()
create(@Body() body: { codes: string; ingresoDate: string }) {
  return this.pickitService.create(body.codes, body.ingresoDate);
}


  /* =================== LISTAR =================== */
  @Get()
  findAll() {
    return this.pickitService.findAll();
  }

  /* =================== EDITAR =================== */
  @Patch(':id')
update(
  @Param('id') id: string,
  @Body()
  body: {
    code: string;
    ingresoDate: string;
    recibio?: string;
    estado: 'AGENCIA' | 'ENTREGADO' | 'DEVOLUCION';
  },
) {
  return this.pickitService.updatePackage(Number(id), body);
}

  /* =================== BORRAR =================== */
  @Delete()
deleteMany(@Body('ids') ids: number[]) {
  if (!ids || ids.length === 0) {
    return { deleted: 0 };
  }
  return this.pickitService.deleteMany(ids);
}
}
