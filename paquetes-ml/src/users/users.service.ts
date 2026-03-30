import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

@Injectable()
export class UsersService {
  private users: User[] = [];

  findAll() {
    return this.users.map(({ password, ...u }) => u);
  }

  private getById(id: number): User {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async changePassword(id: number, password: string) {
    const user = this.getById(id);
    user.password = await bcrypt.hash(password, 10);
    return { message: 'Contraseña actualizada' };
  }

  changeRole(id: number, role: string) {
    const user = this.getById(id);

    // 🛡️ NO eliminar el último ADMIN
    if (user.role === 'admin') {
      const admins = this.users.filter(u => u.role === 'admin');
      if (admins.length === 1) {
        throw new ForbiddenException('Debe existir al menos un administrador');
      }
    }

    user.role = role.toLowerCase();
    return { message: 'Rol actualizado' };
  }

  delete(id: number) {
    const user = this.getById(id);

    // 🛡️ NO eliminar el último ADMIN
    if (user.role === 'admin') {
      const admins = this.users.filter(u => u.role === 'admin');
      if (admins.length === 1) {
        throw new ForbiddenException('Debe existir al menos un administrador');
      }
    }

    this.users = this.users.filter(u => u.id !== id);
    return { message: 'Usuario eliminado' };
  }
}
