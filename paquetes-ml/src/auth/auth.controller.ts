import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  /* ========== LOGIN ========== */
  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    return this.service.login(body.username, body.password);
  }

  /* ========== REGISTER (SOLO ADMIN) ========== */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post('register')
  register(
    @Body()
    body: { username: string; password: string; role: 'ADMIN' | 'USER' },
  ) {
    return this.service.register(
      body.username,
      body.password,
      body.role,
    );
  }

  /* ========== LIMPIAR (PRUEBAS) ========== */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Delete('clear')
  clear() {
    return this.service.clear();
  }
}