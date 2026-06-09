import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not, IsNull } from 'typeorm'; 
import { Package } from '../packages/package.entity';
import { PickitPackage } from '../pickit/pickit.entity';
import { PasswordEntry } from '../passwords/passwords.entity';

@Injectable()
export class BackupService {
  private importProgress = 0;

  constructor(
    @InjectRepository(Package)
    private packageRepo: Repository<Package>,
    @InjectRepository(PickitPackage)
    private pickitRepo: Repository<PickitPackage>,
    @InjectRepository(PasswordEntry)
    private passwordRepo: Repository<PasswordEntry>,
    private dataSource: DataSource, 
  ) {}

  async exportAll() {
    return {
      mercadoLibre: await this.packageRepo.find(),
      pickit: await this.pickitRepo.find(),
      passwords: await this.passwordRepo.find(),
      exportDate: new Date()
    };
  }

  getProgress() {
    return { progress: this.importProgress };
  }

async importAll(data: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.importProgress = 1; 
      
      // 1. Limpieza ultra rápida usando DELETE
      await queryRunner.manager.delete(Package, { id: Not(IsNull()) });
      await queryRunner.manager.delete(PickitPackage, { id: Not(IsNull()) });
      await queryRunner.manager.delete(PasswordEntry, { id: Not(IsNull()) });

      this.importProgress = 5;

      // === 2. IMPORTACIÓN DE MERCADO LIBRE (Lotes de 200) ===
      if (data.mercadoLibre && data.mercadoLibre.length > 0) {
        const total = data.mercadoLibre.length;
        const size = 200; // <--- Bajamos a 200 para no ahogar a SQLite ni a la RAM

        for (let i = 0; i < total; i += size) {
          const chunk = data.mercadoLibre.slice(i, i + size);
          
          // Usamos el QueryBuilder directo para máxima velocidad por bloque
          await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(Package)
            .values(chunk)
            .execute();
          
          this.importProgress = Math.round(((i + chunk.length) / total) * 65) + 5;
          
          // Sugerimos liberación de memoria en sistemas con poca RAM
          if (global.gc) global.gc();
        }
      }

      // === 3. IMPORTACIÓN DE PICKIT (Lotes de 200) ===
      if (data.pickit && data.pickit.length > 0) {
        const totalP = data.pickit.length;
        const sizeP = 200; // <--- Bajamos a 200
        for (let i = 0; i < totalP; i += sizeP) {
          const chunk = data.pickit.slice(i, i + sizeP);
          
          await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(PickitPackage)
            .values(chunk)
            .execute();
          
          this.importProgress = Math.round(((i + chunk.length) / totalP) * 20) + 70;
          
          if (global.gc) global.gc();
        }
      }

      // === 4. IMPORTACIÓN DE CONTRASEÑAS (Protegido por lotes también) ===
      if (data.passwords && data.passwords.length > 0) {
        const totalPass = data.passwords.length;
        const sizePass = 200;
        for (let i = 0; i < totalPass; i += sizePass) {
          const chunk = data.passwords.slice(i, i + sizePass);
          
          await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(PasswordEntry)
            .values(chunk)
            .execute();
        }
      }

      // COMPROMETEMOS LOS CAMBIOS EN UNA SOLA TRANSACCIÓN ESCRITA EN DISCO
      await queryRunner.commitTransaction();
      
      this.importProgress = 100;
      return { success: true };

    } catch (error) {
      // Si algo falla, deshacemos todo para no dejar la DB corrupta
      await queryRunner.rollbackTransaction();
      this.importProgress = 0;
      console.error("ERROR EN IMPORTACIÓN:", error);
      throw error;
    } finally {
      // Liberamos el queryRunner
      await queryRunner.release();
    }
  }
}