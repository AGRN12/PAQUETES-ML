import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    // Si no hay roles requeridos, deja pasar
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Rol no encontrado');
    }

    // 🔥 NORMALIZACIÓN CLAVE
    const userRole = user.role.toUpperCase();
    const allowedRoles = requiredRoles.map(r => r.toUpperCase());

    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('No tienes permisos');
    }

    return true;
  }
}