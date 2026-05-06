import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discente } from './entities/student.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Discente)
    private studentRepository: Repository<Discente>,
  ) {}

  create(createStudentDto: any) {
    const newStudent = this.studentRepository.create(createStudentDto);
    return this.studentRepository.save(newStudent);
  }

  findAll() {
    return this.studentRepository.find({
      // Usamos la sintaxis moderna de objetos para obligar a TypeORM a leer la tabla intermedia
      relations: {
        grupos: true
      }
    });
  }

  findOne(id_discente: number) {
    return this.studentRepository.findOne({
      where: { id_discente: id_discente },
      relations: {
        grupos: true
      }
    });
  }

  async update(id_discente: number, updateStudentDto: any) {
    const student = await this.studentRepository.preload({
      id_discente: id_discente,
      ...updateStudentDto,
    });

    if (!student) {
      throw new NotFoundException(`Alumno con ID ${id_discente} no encontrado`);
    }

    return this.studentRepository.save(student);
  }

  remove(id_discente: number) {
    return this.studentRepository.delete(id_discente);
  }
}