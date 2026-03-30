import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagesModule } from './packages/packages.module';
import { PickitModule } from './pickit/pickit.module';
import { PasswordsModule } from './passwords/passwords.module';
import { BackupModule } from './backup/backup.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'paquetes.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    PackagesModule,
    PickitModule,
    PasswordsModule,
    BackupModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}