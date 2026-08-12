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

  // Nullable: los intentos guardados antes de este campo no lo tienen.
  // Vidas restantes al terminar la partida (0-3). Distinto de "Monedas"
  // (estrellas ganadas): en modo prueba se puede perder por tiempo con
  // vidas > 0, o llegar a 0 vidas sin haber ganado estrellas.
  @Column({ name: 'Vidas', type: 'int', nullable: true })
  Vidas: number | null;

  // Nullable: los intentos guardados antes de este campo no lo tienen.
  // Desglose completo de la partida: cifras objetivo, resultado esperado
  // y un sub-intento por cada vez que el alumno intento abrir la puerta
  // (uno por vida perdida mas el final, exitoso o no), cada uno con su
  // propia secuencia de numeros recogidos (correctos y trampas), orden
  // y tiempo transcurrido al recogerlos.
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

  // Relacion N:1 con Discente
  @ManyToOne(() => Discente, (discente) => discente.intentos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'Discenteid_discente' })
  discente: Discente;
}