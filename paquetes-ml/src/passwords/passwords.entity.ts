import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,

} from 'typeorm';

@Entity()
export class PasswordEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  platform: string; // ej: Gmail, Mercado Libre

  @Column()
  username: string; // correo o usuario

  @Column()
  password: string; // ENCRIPTADA

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;
}