import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Grupo } from '../../groups/entities/group.entity';

@Entity('docentes')
export class Docente {
  @PrimaryGeneratedColumn({ name: 'id_docente' })
  id_docente: number;

  @Column({ name: 'Nombre_Docente', length: 255 })
  Nombre_Docente: string;

  @Column({ name: 'Apellido_Paterno_Docente', length: 255 })
  Apellido_Paterno_Docente: string;

  @Column({ name: 'Apellido_Materno_Docente', length: 255 })
  Apellido_Materno_Docente: string;

  // select: false evita que el hash se filtre en GET /teachers; debe
  // pedirse explicitamente (ver TeachersService.findByUsuario).
  @Column({ name: 'Password', length: 255, select: false })
  Password: string;

  @Column({ name: 'Usuario', length: 255 })
  Usuario: string;

  @OneToMany(() => Grupo, (grupo) => grupo.docente)
  grupos: Grupo[];
}
