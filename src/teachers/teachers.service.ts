import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Docente } from './entities/teacher.entity';
import { Grupo } from '../groups/entities/group.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Docente)
    private teacherRepository: Repository<Docente>,
    @InjectRepository(Grupo)
    private groupRepository: Repository<Grupo>,
  ) {}

  async create(createTeacherDto: any) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createTeacherDto.Password, salt);

    const newTeacher = this.teacherRepository.create({
      ...createTeacherDto,
      Password: hashedPassword,
    });
    return this.teacherRepository.save(newTeacher);
  }

  findAll() {
    return this.teacherRepository.find();
  }

  findOne(id_docente: number) {
    return this.teacherRepository.findOneBy({ id_docente });
  }

  async findByUsuario(usuario: string): Promise<Docente | null> {
    return this.teacherRepository.findOne({ where: { Usuario: usuario } });
  }

  async update(id_docente: number, updateTeacherDto: any) {
    if (updateTeacherDto.Password) {
      const salt = await bcrypt.genSalt();
      updateTeacherDto.Password = await bcrypt.hash(updateTeacherDto.Password, salt);
    } else {
      // Evitar sobreescribir la contrasena con nulo si no se envio en la actualizacion
      delete updateTeacherDto.Password;
    }
    await this.teacherRepository.update(id_docente, updateTeacherDto);
    return this.findOne(id_docente);
  }

  // Resumen de lo que se perderia al eliminar al docente, para confirmar en el dashboard
  async getDeleteImpact(id_docente: number) {
    const groups = await this.groupRepository.find({
      where: { docente: { id_docente } },
      relations: { discentes: true },
    });

    const studentIds = new Set<number>();
    groups.forEach((grupo) =>
      grupo.discentes.forEach((discente) => studentIds.add(discente.id_discente)),
    );

    return {
      groupsCount: groups.length,
      groupNames: groups.map((grupo) => grupo.Nombre_Grupo),
      studentsCount: studentIds.size,
    };
  }

  remove(id: number) {
    return this.teacherRepository.delete(id);
  }
}