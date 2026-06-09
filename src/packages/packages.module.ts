import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { Package } from './package.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Package]), // 👈 ESTO ES CLAVE
  ],
  controllers: [PackagesController],
  providers: [PackagesService],
})
export class PackagesModule {}