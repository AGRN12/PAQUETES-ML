import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Package } from '../packages/package.entity';
import { PickitPackage } from '../pickit/pickit.entity';
import { PasswordEntry } from '../passwords/passwords.entity';

@Injectable()
export class BackupService {
  constructor(
    @InjectRepository(Package)
    private packageRepo: Repository<Package>,

    @InjectRepository(PickitPackage)
    private pickitRepo: Repository<PickitPackage>,

    @InjectRepository(PasswordEntry)
    private passwordRepo: Repository<PasswordEntry>,
  ) {}

  async exportAll() {
    return {
      createdAt: new Date(),
      mercadoLibre: await this.packageRepo.find(),
      pickit: await this.pickitRepo.find(),
      passwords: await this.passwordRepo.find(),
    };
  }

  async importAll(data: any) {
    await this.packageRepo.clear();
    await this.pickitRepo.clear();
    await this.passwordRepo.clear();

    if (data.mercadoLibre?.length) {
      await this.packageRepo.save(data.mercadoLibre);
    }

    if (data.pickit?.length) {
      await this.pickitRepo.save(data.pickit);
    }

    if (data.passwords?.length) {
      await this.passwordRepo.save(data.passwords);
    }

    return { message: 'Backup restaurado correctamente' };
  }
}
