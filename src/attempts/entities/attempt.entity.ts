import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Discente } from '../../students/entities/student.entity';

@Entity('intentos')
export class Intento {
  @PrimaryGeneratedColumn({ name: 'id_intento' })
  id_intento: number;

  @Column({ name: 'Tiempo' })
  Tiempo: number;

  @Column({ name: 'Dificultad' })
  Dificultad: number;

  @Column({ name: 'Puntos' })
  Puntos: number;

  @Column({ name: 'Emocion' })
  Emocion: number;

  @Column({ name: 'Monedas' })
  Monedas: number;

  @Column({ name: 'Numero_de_intento' })
  Numero_de_intento: number;

  // Nullable: los intentos guardados antes de este campo no la tienen.
  @Column({ name: 'Operacion', nullable: true })
  Operacion: string;

  @CreateDateColumn({ name: 'Fecha' })
  Fecha: Date;

  // Relacion N:1 con Discente
  @ManyToOne(() => Discente, (discente) => discente.intentos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'Discenteid_discente' })
  discente: Discente;
}