import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Grupo } from '../../groups/entities/group.entity';
import { Intento } from '../../attempts/entities/attempt.entity';

@Entity('discente')
export class Discente {
  @PrimaryGeneratedColumn({ name: 'id_discente' })
  id_discente: number;

  @Column({ name: 'Nombre_Discente', length: 255 })
  Nombre_Discente: string;

  @Column({ name: 'Apellido_Paterno_Discente', length: 255 })
  Apellido_Paterno_Discente: string;

  @Column({ name: 'Apellido_Materno_Discente', length: 255 })
  Apellido_Materno_Discente: string;

  // Baja logica: oculta al alumno de las vistas del docente sin perder su
  // historial de intentos.
  @Column({ name: 'Activo', default: true })
  Activo: boolean;

  // Indice de punto alcanzado en el mapa (0 = inicio). Actualizado desde
  // MapScene via PATCH /discentes/:id para retomar donde se quedo, en vez
  // de reiniciar siempre en el primer nivel.
  @Column({ name: 'NivelMapaTierra', type: 'int', default: 0 })
  NivelMapaTierra: number;

  @Column({ name: 'NivelMapaAgua', type: 'int', default: 0 })
  NivelMapaAgua: number;

  @ManyToMany(() => Grupo, (grupo) => grupo.discentes, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'Discente_Grupo',
    joinColumn: {
      name: 'Discenteid_discente',
      referencedColumnName: 'id_discente',
    },
    inverseJoinColumn: {
      name: 'Grupoid_grupo',
      referencedColumnName: 'id_grupo',
    },
  })
  grupos: Grupo[];

  @OneToMany(() => Intento, (intento) => intento.discente)
  intentos: Intento[];
}
