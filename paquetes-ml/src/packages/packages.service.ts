import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from './package.entity';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepo: Repository<Package>,
  ) {}

  async processInput(
    input: string,
    person: string,
    date: string,
    colecta: number,
  ) {
    const lines = input
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const packagesToSave: Partial<Package>[] = [];

    let drop = 0;
    let devoluciones = 0;

    for (const line of lines) {
      let code = line;

      // Por si viene JSON
      if (line.startsWith('{')) {
        try {
          code = JSON.parse(line).id;
        } catch {
          continue;
        }
      }

      const isDevolucion =
        code.includes('K') && code.includes('MLM');

      packagesToSave.push({
        code,
        type: isDevolucion ? 'DEVOLUCION' : 'DROP_OFF',
        person,
        colecta,
        date,
      });

      isDevolucion ? devoluciones++ : drop++;
    }

    await this.packageRepo.save(packagesToSave);

    return {
      total: packagesToSave.length,
      drop,
      devoluciones,
    };
  }

  async findAll() {
    return this.packageRepo.find({
      order: { id: 'DESC' },
    });
  }

  // logica de actualizacion
async updatePackage(
  id: number,
  data: Partial<Package>,
) {
  const pkg = await this.packageRepo.findOneBy({ id });

  if (!pkg) {
    throw new Error('Paquete no encontrado');
  }

  Object.assign(pkg, data);

  await this.packageRepo.save(pkg);

  return pkg;
}

//logica para elimnar repetidos

async removeDuplicates(){

  //traemos todos ordenados por fecha de creacion
  const packages = await this.packageRepo.find({
    order: { createdAt: 'ASC' },
  });

  const seen = new Set<string>();
  const toDelete: number[] = [];

  for (const pkg of packages) {
    if(seen.has(pkg.code)) {
      toDelete.push(pkg.id);
    }else{
      seen.add(pkg.code);
    }
  }
  if(toDelete.length  > 0) {
    await this.packageRepo.delete(toDelete);
  }
  return{
    delete: toDelete.length,
  };
}
async deleteMany(ids: number[]) {
  if (!ids || ids.length === 0) {
    return { deleted: 0 };
  }

  await this.packageRepo.delete(ids);

  return {
    deleted: ids.length,
  };
}

}
