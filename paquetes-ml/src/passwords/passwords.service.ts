import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordEntry } from './passwords.entity';
import { encrypt, decrypt } from '../common/crypto.util';

@Injectable()
export class PasswordsService {
  constructor(
    @InjectRepository(PasswordEntry)
    private readonly repo: Repository<PasswordEntry>,
  ) {}

  /* ===== CREAR ===== */
  async create(data: {
    platform: string;
    username: string;
    password: string;
    notes?: string;
  }) {
    const entry = this.repo.create({
      platform: data.platform,
      username: data.username,
      password: encrypt(data.password), // 🔐 ENCRIPTAR
      notes: data.notes,
    });

    return this.repo.save(entry);
  }

  /* ===== LISTAR ===== */
  async findAll() {
    const list = await this.repo.find();

    return list.map(item => ({
      ...item,
      password: decrypt(item.password), // 🔓 DESENCRIPTAR
    }));
  }

  /* ===== EDITAR ===== */
  async update(
    id: number,
    data: {
      platform: string;
      username: string;
      password?: string;
      notes?: string;
    },
  ) {
    const entry = await this.repo.findOne({ where: { id } });
    if (!entry) throw new Error('No encontrado');

    entry.platform = data.platform;
    entry.username = data.username;
    entry.notes = data.notes;

    if (data.password) {
      entry.password = encrypt(data.password); // 🔐
    }

    return this.repo.save(entry);
  }

  /* ===== BORRAR ===== */
  async delete(id: number) {
    return this.repo.delete(id);
  }
  async exportData() {
  return await this.repo.find();
}

async importData(data: any[]) {
  if (!Array.isArray(data)) {
    throw new Error('Formato inválido');
  }

  await this.repo.clear(); // ⚠ Borra todo antes de importar
  await this.repo.save(data);

  return { imported: data.length };
}
}