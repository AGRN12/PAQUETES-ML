import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackupController } from './backup.controller';
import { BackupService } from './backup.service';

import { Package } from '../packages/package.entity';
import { PickitPackage } from '../pickit/pickit.entity';
import { PasswordEntry } from '../passwords/passwords.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Package,
      PickitPackage,
      PasswordEntry,
    ]),
  ],
  controllers: [BackupController],
  providers: [BackupService],
})
export class BackupModule {}
