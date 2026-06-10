import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discente } from './entities/student.entity';
import { Intento } from '../attempts/entities/attempt.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Discente)
    private studentRepository: Repository<Discente>,
    @InjectRepository(Intento)
    private intentoRepository: Repository<Intento>,
  ) {}

  create(createStudentDto: any) {
    const newStudent = this.studentRepository.create(createStudentDto);
    return this.studentRepository.save(newStudent);
  }

  findAll() {
    return this.studentRepository.find({
      // Usamos la sintaxis moderna de objetos para obligar a TypeORM a leer la tabla intermedia
      relations: {
        grupos: true,
      },
    });
  }
  findAllByTeacher(id_docente: number) {
    return this.studentRepository.createQueryBuilder('discente')
      .innerJoinAndSelect('discente.grupos', 'grupo')
      .innerJoin('grupo.docente', 'docente')
      .where('docente.id_docente = :id_docente', { id_docente: id_docente })
      .getMany();
  }

  findOne(id_discente: number) {
    return this.studentRepository.findOne({
      where: { id_discente: id_discente },
      relations: {
        grupos: true,
      },
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

  // 1. METODO PARA GUARDAR EL INTENTO
  async saveAttempt(id_discente: number, attemptData: any) {
    const student = await this.studentRepository.findOne({
      where: { id_discente },
      relations: { intentos: true },
    });

    if (!student) throw new NotFoundException('Alumno no encontrado');

    // Auto-calculamos que numero de intento es basado en su historial
    const numeroDeIntento = student.intentos.length + 1;

    const newAttempt = this.intentoRepository.create({
      ...attemptData,
      Numero_de_intento: numeroDeIntento,
      discente: student,
    });

    return this.intentoRepository.save(newAttempt);
  }

  // 2. METODO PARA CALCULAR ESTADISTICAS
  async getStudentStats(id_discente: number) {
    const student = await this.studentRepository.findOne({
      where: { id_discente },
      relations: { intentos: true },
    });

    if (!student) throw new NotFoundException('Alumno no encontrado');

    const intentos = student.intentos;

    // Valores por defecto si aun no ha jugado
    if (intentos.length === 0) {
      return {
        avgTime: 0,
        attempts: 0,
        topEmotion: 2,
        difficulty: 1,
        recentSessions: [],
      };
    }

    const attemptsCount = intentos.length;

    // Calculo de Promedios
    const avgTime =
      intentos.reduce((acc, curr) => acc + curr.Tiempo, 0) / attemptsCount;
    const avgDiff = Math.round(
      intentos.reduce((acc, curr) => acc + curr.Dificultad, 0) / attemptsCount,
    );

    // Encontrar la Emocion mas frecuente (Moda)
    const emotionCounts = intentos.reduce(
      (acc, curr) => {
        acc[curr.Emocion] = (acc[curr.Emocion] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );
    const topEmotion = Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[Number(a)] > emotionCounts[Number(b)] ? a : b,
    );

    // Obtener los ultimos 3 intentos para el historial
    const recentSessions = intentos.map((i) => ({
      numero: i.Numero_de_intento,
      score: i.Puntos,
      emotion: i.Emocion,
      fecha: i.Fecha,
    }));

    return {
      avgTime: Math.round(avgTime),
      attempts: attemptsCount,
      topEmotion: Number(topEmotion),
      difficulty: avgDiff,
      recentSessions: recentSessions.reverse(),
    };
  }
}
