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

  // Nullable: intentos guardados antes de este campo no lo tienen.
  @Column({ name: 'Operacion', nullable: true })
  Operacion: string;

  // Nullable: intentos guardados antes de este campo no lo tienen. Vidas
  // restantes al terminar (0-3); distinto de "Monedas" (estrellas): en
  // modo prueba se puede perder por tiempo con vidas > 0.
  @Column({ name: 'Vidas', type: 'int', nullable: true })
  Vidas: number | null;

  // Nullable: intentos guardados antes de este campo no lo tienen. Forma
  // del JSON (no expresable en el tipo de columna jsonb): un sub-intento
  // por cada vez que el alumno intento abrir la puerta (uno por vida
  // perdida mas el final), cada uno con su secuencia de numeros recogidos.
  @Column({ name: 'Desglose', type: 'jsonb', nullable: true })
  Desglose: {
    objetivo: number[];
    trampas: number[];
    resultado: number;
    intentos: {
      numero: number;
      exitoso: boolean;
      vidasRestantes: number;
      eventos: {
        orden: number;
        valor: number;
        tipo: 'objetivo' | 'trampa';
        correcta: boolean;
        tiempo: number;
      }[];
    }[];
  } | null;

  @CreateDateColumn({ name: 'Fecha' })
  Fecha: Date;

  @ManyToOne(() => Discente, (discente) => discente.intentos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'Discenteid_discente' })
  discente: Discente;
}