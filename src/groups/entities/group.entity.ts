import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { Docente } from '../../teachers/entities/teacher.entity';
import { Discente } from '../../students/entities/student.entity';

@Entity('grupos')
export class Grupo {
  @PrimaryGeneratedColumn({ name: 'id_grupo' })
  id_grupo: number;

  @Column({ name: 'Nombre_Grupo', length: 255 })
  Nombre_Grupo: string;

  @Column({ name: 'Año' })
  Año: number;

  @Column({ name: 'Grado' })
  Grado: number;

  // Relación: Muchos Grupos pertenecen a un Docente (N:1)
  @ManyToOne(() => Docente, (docente) => docente.grupos)
  @JoinColumn({ name: 'Docenteid_docente' })
  docente: Docente;

  // Relación: Muchos a Muchos con Discente (N:M)
  @ManyToMany(() => Discente, (discente) => discente.grupos)
  discentes: Discente[];
}