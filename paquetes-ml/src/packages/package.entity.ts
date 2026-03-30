import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Package {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  type: 'DROP_OFF' | 'DEVOLUCION' | 'PICK_UP';

  @Column()
  person: string;

  @Column()
  colecta: number;

  @Column()
  date: string; // fecha manual

  @CreateDateColumn()
  createdAt: Date;
}
