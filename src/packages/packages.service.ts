import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, Brackets} from 'typeorm'; 
import { Package } from './package.entity';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepo: Repository<Package>,
  ) {}

  /* =================== FILTRADO =================== */

async findByMonthsAndYear(months: number[], year: number) {
  // 1. Validación de seguridad: si no hay meses, no busques nada.
  if (!months || months.length === 0) {
    return [];
  }

  const query = this.packageRepo.createQueryBuilder('package');

  // 2. Convertimos los meses a formato "01", "02", etc.
  const monthStrings = months.map(m => m < 10 ? `0${m}` : `${m}`);

  // 3. Usamos Brackets para agrupar los OR y que no choquen con otros filtros
  query.andWhere(new Brackets(qb => {
    monthStrings.forEach((mStr, index) => {
      const pattern = `${year}-${mStr}%`;
      const paramName = `val${index}`;
      
      if (index === 0) {
        qb.where(`package.date LIKE :${paramName}`, { [paramName]: pattern });
      } else {
        qb.orWhere(`package.date LIKE :${paramName}`, { [paramName]: pattern });
      }
    });
  }));

  // 4. Retornamos todo (Sin .take) para que el reporte e impresión salgan completos
  return await query.orderBy('package.date', 'DESC').getMany();
}

  /* =================== ELIMINACIÓN =================== */

  async deleteMany(ids: number[]) {
    if (!ids || ids.length === 0) return { deleted: 0 };

    // Borramos por lotes de 200 para cuidar la RAM de 4GB
    const chunkSize = 200;
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      await this.packageRepo.delete({ id: In(chunk) });
    }

    return { deleted: ids.length };
  }

  // Este es el que faltaba para el Reporte Mensual
  async deleteByMonthsAndYear(months: number[], year: number) {
    const packagesToDelete = await this.findByMonthsAndYear(months, year);
    const ids = packagesToDelete.map(p => p.id);
    
    return await this.deleteMany(ids);
  }

  async removeDuplicates() {
    const packages = await this.packageRepo.find({
      select: ['id', 'code'],
      order: { id: 'ASC' },
    });

    const seen = new Set<string>();
    const toDelete: number[] = [];

    for (const pkg of packages) {
      if (seen.has(pkg.code)) {
        toDelete.push(pkg.id);
      } else {
        seen.add(pkg.code);
      }
    }

    return await this.deleteMany(toDelete);
  }

  /* =================== PROCESAMIENTO =================== */

  async processInput(input: string, person: string, date: string, colecta: number) {
    const lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const packagesToSave: Partial<Package>[] = [];
    let drop = 0, devoluciones = 0;

    for (const line of lines) {
      let code = line.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();

      if (code.startsWith('{')) {
        try {
          const parsed = JSON.parse(code);
          code = parsed.id || code;
        } catch {
          console.warn("JSON malformado, procesando como texto.");
        }
      }

      const isDevolucion = code.includes('K') && code.includes('MLM');

      packagesToSave.push({
        code,
        type: isDevolucion ? 'DEVOLUCION' : 'DROP_OFF',
        person,
        colecta,
        date,
      });

      isDevolucion ? devoluciones++ : drop++;
    }

    if (packagesToSave.length > 0) {
      // Dividimos el insert en trozos de 500 para SQLite
      for (let i = 0; i < packagesToSave.length; i += 500) {
        const chunk = packagesToSave.slice(i, i + 500);
        await this.packageRepo.createQueryBuilder()
          .insert().into(Package).values(chunk).execute();
      }
    }

    return { total: packagesToSave.length, drop, devoluciones };
  }

async findAll(page: number = 1, limit: number = 50, search?: string) {
  const query = this.packageRepo.createQueryBuilder('package');

  // Si el usuario escribió algo en el buscador
  if (search && search.trim() !== '') {
    query.where('package.code LIKE :search', { search: `%${search}%` })
         .orWhere('package.person LIKE :search', { search: `%${search}%` });
  }

  query
    .orderBy('package.id', 'DESC')
    .skip((page - 1) * limit)
    .take(limit);

  const [result, total] = await query.getManyAndCount();

  return {
    data: result,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
}
async findForReport(date: string, colecta: string) {
  const query = this.packageRepo.createQueryBuilder('package')
    .where('package.date = :date', { date });

  if (colecta && colecta !== 'ALL') {
    query.andWhere('package.colecta = :colecta', { colecta: Number(colecta) });
  }

  return await query.orderBy('package.id', 'ASC').getMany(); // Sin take/skip
}
  async updatePackage(id: number, data: Partial<Package>) {
    const pkg = await this.packageRepo.findOneBy({ id });
    if (!pkg) throw new Error('Paquete no encontrado');
    Object.assign(pkg, data);
    return await this.packageRepo.save(pkg);
  }
}