import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  /* =================== INGRESAR PAQUETES =================== */
  async create(codes: string, ingresoDate: string) {
    const list = codes
      .split('\n')
      .map(c => c.trim())
      .filter(Boolean);

    for (const code of list) {
      const pkg = this.pickitRepo.create({
        code,
        ingresoDate,        // 📅 solo fecha (sin hora)
        estado: 'AGENCIA',  // estado inicial
        recibio: null,      // vacío
        salidaDate: null,   // sin salida
      });

      await this.pickitRepo.save(pkg);
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
    await this.pickitRepo.delete(ids);
    return { deleted: ids.length };
  }
}
