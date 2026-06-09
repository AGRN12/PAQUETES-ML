import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PickitPackage } from './pickit.entity';

export type PickitEstado = 'AGENCIA' | 'ENTREGADO' | 'DEVOLUCION';

/* ===== FECHA CDMX ===== */
function nowCDMX(): Date {
  return new Date(
    new Date().toLocaleString('en-US', {
      timeZone: 'America/Mexico_City',
    }),
  );
}

@Injectable()
export class PickitService {
  constructor(
    @InjectRepository(PickitPackage)
    private readonly pickitRepo: Repository<PickitPackage>,
  ) {}

  /* =================== INGRESAR PAQUETES (OPTIMIZADO) =================== */
  async create(codes: string, ingresoDate: string) {
    const list = codes
      .split('\n')
      .map(c => c.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, "")) // Limpieza de caracteres
      .filter(Boolean);

    // Creamos un array de objetos para insertar de un solo golpe
    const packagesToInsert = list.map(code => ({
      code,
      ingresoDate,        // 📅 solo fecha (sin hora)
      estado: 'AGENCIA' as PickitEstado,
      recibio: null,
      salidaDate: null,
    }));

    // Uso de QueryBuilder para inserción masiva (mucho más rápido que .save en bucle)
    if (packagesToInsert.length > 0) {
      await this.pickitRepo
        .createQueryBuilder()
        .insert()
        .into(PickitPackage)
        .values(packagesToInsert)
        .execute();
    }

    return { total: list.length };
  }

  /* =================== LISTAR =================== */
  async findAll() {
    return this.pickitRepo.find({
      order: { id: 'DESC' },
    });
  }

  /* =================== EDITAR PAQUETE =================== */
  async updatePackage(
    id: number,
    data: {
      code: string;
      ingresoDate: string;
      recibio?: string;
      estado: PickitEstado;
      salidaDate?: string; // 👈 VIENE DEL FRONT
    },
  ) {
    const pkg = await this.pickitRepo.findOne({ where: { id } });

    if (!pkg) throw new Error('Paquete no encontrado');

    pkg.code = data.code;
    pkg.ingresoDate = data.ingresoDate;
    pkg.recibio = data.recibio ?? null;
    pkg.estado = data.estado;

    // 🔁 LÓGICA CORRECTA
    if (data.estado === 'ENTREGADO' || data.estado === 'DEVOLUCION') {
      if (data.salidaDate) {
        // 👉 si el usuario mandó fecha/hora, usarla
        pkg.salidaDate = new Date(data.salidaDate);
      } else if (!pkg.salidaDate) {
        // 👉 solo si NO existe, poner automática
        pkg.salidaDate = nowCDMX();
      }
    } else {
      pkg.salidaDate = null;
    }

    await this.pickitRepo.save(pkg);
    return pkg;
  }

  /* =================== BORRAR =================== */
  async deleteMany(ids: number[]) {
    if (!ids || ids.length === 0) return { deleted: 0 };
    
    // Usamos In(ids) para asegurar un borrado eficiente en una sola consulta
    await this.pickitRepo.delete({ id: In(ids) });
    return { deleted: ids.length };
  }
}