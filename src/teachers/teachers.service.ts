import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Docente } from './entities/teacher.entity';
import { Grupo } from '../groups/entities/group.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Docente)
    private teacherRepository: Repository<Docente>,
    @InjectRepository(Grupo)
    private groupRepository: Repository<Grupo>,
  ) {}

  async create(createTeacherDto: CreateTeacherDto) {
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
    // Password tiene select:false por defecto (ver entidad); aqui si lo
    // necesitamos para poder compararlo con bcrypt durante el login.
    return this.teacherRepository
      .createQueryBuilder('docente')
      .addSelect('docente.Password')
      .where('docente.Usuario = :usuario', { usuario })
      .getOne();
  }

  async update(id_docente: number, updateTeacherDto: UpdateTeacherDto) {
    const existing = await this.findOne(id_docente);
    if (!existing) {
      throw new NotFoundException(`Docente con ID ${id_docente} no encontrado`);
    }

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

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException(`Docente con ID ${id} no encontrado`);
    }
    return this.teacherRepository.delete(id);
  }
}