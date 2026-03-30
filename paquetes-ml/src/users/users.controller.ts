import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  

  // 🔐 Cambiar contraseña
  @Patch(':id/password')
  changePassword(
    @Param('id') id: number,
    @Body('password') password: string,
  ) {
    return this.usersService.changePassword(+id, password);
  }

  // 🎭 Cambiar rol (NO a sí mismo)
  @Patch(':id/role')
  changeRole(
    @Param('id') id: number,
    @Body('role') role: string,
    @Req() req,
  ) {
    if (req.user.sub === +id) {
      throw new ForbiddenException('No puedes cambiar tu propio rol');
    }

    return this.usersService.changeRole(+id, role);
  }

  // 🗑 Eliminar usuario (NO a sí mismo)
  @Delete(':id')
  delete(@Param('id') id: number, @Req() req) {
    if (req.user.sub === +id) {
      throw new ForbiddenException('No puedes eliminar tu propio usuario');
    }

    return this.usersService.delete(+id);
  }

  
}
