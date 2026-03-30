import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  /* ================= LOGIN ================= */
  async login(username: string, password: string) {
    const user = await this.repo.findOne({ where: { username } });
    if (!user) throw new Error('Usuario no existe');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new Error('Contraseña incorrecta');

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      token: this.jwt.sign(payload),
    };
  }

  /* ================= REGISTER ================= */
  async register(username: string, password: string, role: 'ADMIN' | 'USER') {
    const exists = await this.repo.findOne({ where: { username } });
    if (exists) throw new Error('Usuario ya existe');

    const hash = await bcrypt.hash(password, 10);

    const user = this.repo.create({
      username,
      password: hash,
      role,
    });

    await this.repo.save(user);

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  }

  /* ================= LIMPIAR (PRUEBAS) ================= */
  async clear() {
    await this.repo.clear();
    return { ok: true };
  }
}