import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import { ChangeRoleDto } from '../dto/change-role.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@Controller('users')

export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id/role')
  changeRole(
    @Param('id') id: string,
    @Body() dto: ChangeRoleDto,
    @Req() req,
  ) {
    return this.usersService.changeRole(
      +id,
      dto.role,
      req.user.id,
    );
  }

  @Patch(':id/password')
  changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      +id,
      dto.password,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.usersService.remove(+id, req.user.id);
  }
}