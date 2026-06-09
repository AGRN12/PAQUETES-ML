import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!roles) return true;
    

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    console.log('Usuario en el Guard:', user); // 👈 AGREGA ESTO
  console.log('Roles requeridos:', roles);
  if (!user || !user.role) {
    console.error('El usuario no tiene rol o no existe en la petición');
    return false;
  }
    return user && roles.includes(user.role.toUpperCase());
  }
}
