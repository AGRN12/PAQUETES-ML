import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordsService } from './passwords.service';
import { PasswordsController } from './passwords.controller';
import { PasswordEntry } from './passwords.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PasswordEntry])],
  providers: [PasswordsService],
  controllers: [PasswordsController],
})
export class PasswordsModule {}