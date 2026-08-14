import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Discente } from '../../students/entities/student.entity';

// Se escribe una sola vez al cumplirse la regla (ver
// AchievementsService.evaluarYDesbloquear). A diferencia de las rachas,
// nunca se recalcula ni se puede perder.
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
