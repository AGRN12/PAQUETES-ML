import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagesModule } from './packages/packages.module';
import { PickitModule } from './pickit/pickit.module';
import { PasswordsModule } from './passwords/passwords.module';
import { BackupModule } from './backup/backup.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { MulterModule } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';

// --- LÓGICA DE RUTA UNIVERSAL ---
const isProd = process.env.NODE_ENV === 'production' || !!(process as any).resourcesPath;

let dbPath: string;

if (isProd) {
  // En el EXE, usamos APPDATA (evitamos usar 'app' de electron aquí para no romper Nest)
  const appDataPath = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
  const fullPath = path.join(appDataPath, 'cyber-gutro-data');

  // Si no existe la carpeta en AppData, la creamos para que SQLite no falle
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  dbPath = path.join(fullPath, 'paquetes.db');
} else {
  // Ruta de desarrollo en tu disco E:
  dbPath = 'E:/proyectos/paquetes-ml/paquetes.db';
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: dbPath,
      entities: [path.join(__dirname, '**', '*.entity{.ts,.js}')],
      
      // --- OPTIMIZACIONES PARA MÁQUINAS VIEJAS ---
      synchronize: true, // En el cyber ya no necesitas sincronizar cada vez
      logging: false,
      
      // Esto ayuda a que SQLite no bloquee la PC de 4GB al buscar
      extra: {
        poolSize: 1, // Evita peleas de hilos en procesadores viejos
        pragma: [
          'PRAGMA journal_mode = WAL', // Modo de escritura rápida
          'PRAGMA synchronous = NORMAL', // Menos carga al disco duro
          'PRAGMA cache_size = -2000', // Usa ~2MB de cache para no saturar la RAM
        ]
      }
    }),
    MulterModule.register({
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
    PackagesModule,
    PickitModule,
    PasswordsModule,
    BackupModule,
    AuthModule,
    UsersModule,
    AdminModule
  ],
})
export class AppModule {}