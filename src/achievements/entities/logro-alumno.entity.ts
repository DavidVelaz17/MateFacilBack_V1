import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Discente } from '../../students/entities/student.entity';

// Un logro se escribe una sola vez, en el momento exacto en que su regla
// se cumple por primera vez (ver AchievementsService.evaluarYDesbloquear).
// A diferencia de las rachas, nunca se recalcula ni se puede perder.
@Entity('logros_alumno')
export class LogroAlumno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'Codigo' })
  Codigo: string;

  @CreateDateColumn({ name: 'FechaDesbloqueado' })
  FechaDesbloqueado: Date;

  @ManyToOne(() => Discente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'Discenteid_discente' })
  discente: Discente;
}
