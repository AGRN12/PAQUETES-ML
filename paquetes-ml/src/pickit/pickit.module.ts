import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PickitService } from './pickit.service';
import { PickitController } from './pickit.controller';
import { PickitPackage } from './pickit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PickitPackage]), // 🔴 ESTA LÍNEA ES LA CLAVE
  ],
  controllers: [PickitController],
  providers: [PickitService],
})
export class PickitModule {}
