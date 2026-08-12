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

  // Baja logica: un alumno inactivo se oculta de las vistas de los docentes
  // sin perder su historial de intentos.
  @Column({ name: 'Activo', default: true })
  Activo: boolean;

  // Progreso del modo historia en cada mundo del mapa (indice de punto
  // alcanzado, 0 = inicio). Se actualiza desde MapScene via
  // PATCH /discentes/:id para que el mapa retome donde el alumno se quedo,
  // en vez de reiniciar siempre en el primer nivel.
  @Column({ name: 'NivelMapaTierra', type: 'int', default: 0 })
  NivelMapaTierra: number;

  @Column({ name: 'NivelMapaAgua', type: 'int', default: 0 })
  NivelMapaAgua: number;

  // Relación: Muchos a Muchos con Grupo (Tabla intermedia Discente_Grupo)
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

  //Relación: Un Discente tiene muchos Intentos (1:N)
  @OneToMany(() => Intento, (intento) => intento.discente)
  intentos: Intento[];
}
