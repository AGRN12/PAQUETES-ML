import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('pickit_packages') // 🔥 nombre explícito de tabla
export class PickitPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  // fecha de ingreso (SIN hora)
  @Column({ type: 'date' })
  ingresoDate: string;

  // quién recibió (editable después)
  @Column({ type: 'text', nullable: true })
  recibio: string | null;

  // estado del paquete
  @Column({
    type: 'text',
    default: 'AGENCIA',
  })
  estado: 'AGENCIA' | 'ENTREGADO' | 'DEVOLUCION';

  // fecha de salida (CON hora)
  @Column({ type: 'datetime', nullable: true })
  salidaDate: Date | null;
}
