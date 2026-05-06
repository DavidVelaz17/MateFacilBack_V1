import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Docente } from './entities/teacher.entity';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Docente)
    private teacherRepository: Repository<Docente>,
  ) {}

  create(createTeacherDto: any) {
    const newTeacher = this.teacherRepository.create(createTeacherDto);
    return this.teacherRepository.save(newTeacher);
  }

  findAll() {
    return this.teacherRepository.find();
  }

  findOne(id_docente: number) {
    return this.teacherRepository.findOneBy({ id_docente });
  }

  async update(id_docente: number, updateTeacherDto: any) {
    await this.teacherRepository.update(id_docente, updateTeacherDto);
    return this.findOne(id_docente);
  }

  remove(id: number) {
    return this.teacherRepository.delete(id);
  }
}
