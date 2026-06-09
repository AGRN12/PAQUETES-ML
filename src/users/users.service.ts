import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common'; // Agregamos OnModuleInit
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../auth/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService implements OnModuleInit { // Implementamos la interfaz
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  // ESTA FUNCIÓN SE EJECUTA SOLA AL ARRANCAR EL SERVER
async onModuleInit() {
  const adminUsername = 'admin';
  
  // 1. Forzamos el borrado para que no haya basura de intentos anteriores
  await this.repo.delete({ username: adminUsername });

  // 2. Creamos el hash exacto que bcryptjs comparará en el AuthService
  const hashedPassword = await bcrypt.hash('admin', 10);
  
  await this.repo.save({
    username: adminUsername,
    password: hashedPassword,
    role: 'ADMIN', // Importante: Mayúsculas para tu payload del JWT
  });

  console.log('🚀 [BACKEND] Base de Datos en E: actualizada. Prueba con admin / admin');
}

  findAll() {
    return this.repo.find({
      select: ['id', 'username', 'role'],
    });
  }

  async create(dto: CreateUserDto) {
    const exists = await this.repo.findOne({
      where: { username: dto.username },
    });

    if (exists)
      throw new BadRequestException('Usuario ya existe');

    const user = this.repo.create({
      username: dto.username,
      password: await bcrypt.hash(dto.password, 10),
      role: (dto.role ?? 'USER').toUpperCase(),
    });

    return this.repo.save(user);
  }

  async changeRole(
    id: number,
    role: string,
    currentUserId: number,
  ) {
    if (id === currentUserId)
      throw new BadRequestException(
        'No puedes cambiar tu propio rol',
      );

    await this.repo.update(id, {
      role: role.toUpperCase(),
    });
  }

  async changePassword(id: number, password: string) {
    const hash = await bcrypt.hash(password, 10);
    await this.repo.update(id, { password: hash });
  }

  async remove(id: number, currentUserId: number) {
    if (id === currentUserId)
      throw new BadRequestException(
        'No puedes eliminar tu propio usuario',
      );

    await this.repo.delete(id);
  }
}