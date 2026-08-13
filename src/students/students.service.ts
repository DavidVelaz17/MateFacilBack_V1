import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discente } from './entities/student.entity';
import { Intento } from '../attempts/entities/attempt.entity';
import { CreateDiscenteDto } from './dto/create-discente.dto';
import { UpdateDiscenteDto } from './dto/update-discente.dto';
import { CreateAttemptDto } from '../attempts/dto/create-attempt.dto';
import { AchievementsService } from '../achievements/achievements.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Discente)
    private studentRepository: Repository<Discente>,
    @InjectRepository(Intento)
    private intentoRepository: Repository<Intento>,
    private achievementsService: AchievementsService,
  ) {}

  create(createStudentDto: CreateDiscenteDto) {
    const newStudent = this.studentRepository.create(createStudentDto);
    return this.studentRepository.save(newStudent);
  }

  async findAll() {
    const students = await this.studentRepository.find({
      // Usamos la sintaxis moderna de objetos para obligar a TypeORM a leer la tabla intermedia
      relations: {
        grupos: true,
      },
    });

    // Total de estrellas (Monedas) acumuladas por alumno, para mostrarlo en
    // el listado sin tener que consultar /discentes/:id/stats uno por uno.
    const starsRaw = await this.intentoRepository
      .createQueryBuilder('intento')
      .leftJoin('intento.discente', 'discente')
      .select('discente.id_discente', 'id_discente')
      .addSelect('SUM(intento.Monedas)', 'totalStars')
      .groupBy('discente.id_discente')
      .getRawMany();

    const starsByStudent = new Map<number, number>(
      starsRaw.map((row) => [Number(row.id_discente), Number(row.totalStars)]),
    );

    return students.map((student) => ({
      ...student,
      totalStars: starsByStudent.get(student.id_discente) ?? 0,
    }));
  }

  findOne(id_discente: number) {
    return this.studentRepository.findOne({
      where: { id_discente: id_discente },
      relations: {
        grupos: true,
      },
    });
  }

  async update(id_discente: number, updateStudentDto: UpdateDiscenteDto) {
    const student = await this.studentRepository.preload({
      id_discente: id_discente,
      ...updateStudentDto,
    });

    if (!student) {
      throw new NotFoundException(`Alumno con ID ${id_discente} no encontrado`);
    }

    await this.studentRepository.save(student);

    // Si esta actualizacion toco el progreso del mapa (MapScene ->
    // PATCH /discentes/:id al terminar un nivel), revisamos ahi mismo si
    // eso acaba de completar "Mundo Terrestre"/"Mundo Acuatico": a
    // diferencia de los demas logros, estos no dependen de un intento
    // nuevo sino de este campo, que llega en un PATCH aparte del
    // POST /attempts que guarda la partida (ver saveAttempt).
    let logrosNuevos: Awaited<
      ReturnType<AchievementsService['evaluarYDesbloquear']>
    > = [];

    if (
      updateStudentDto.NivelMapaTierra !== undefined ||
      updateStudentDto.NivelMapaAgua !== undefined
    ) {
      const actualizado = await this.studentRepository.findOne({
        where: { id_discente },
        relations: { intentos: true },
      });
      if (actualizado) {
        logrosNuevos = await this.achievementsService.evaluarYDesbloquear(
          actualizado,
          actualizado.intentos,
        );
      }
    }

    return { ...student, logrosNuevos };
  }

  async remove(id_discente: number) {
    const existing = await this.studentRepository.findOneBy({ id_discente });
    if (!existing) {
      throw new NotFoundException(`Alumno con ID ${id_discente} no encontrado`);
    }
    return this.studentRepository.delete(id_discente);
  }

  // Quita al alumno de un grupo puntual sin tocar su registro ni su
  // historial de intentos: solo modifica la tabla intermedia Discente_Grupo.
  async removeFromGroup(id_discente: number, id_grupo: number) {
    const student = await this.studentRepository.findOne({
      where: { id_discente },
      relations: { grupos: true },
    });

    if (!student) {
      throw new NotFoundException(`Alumno con ID ${id_discente} no encontrado`);
    }

    student.grupos = (student.grupos || []).filter(
      (grupo) => grupo.id_grupo !== id_grupo,
    );

    return this.studentRepository.save(student);
  }

  // 1. METODO PARA GUARDAR EL INTENTO
  async saveAttempt(id_discente: number, attemptData: CreateAttemptDto) {
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

    const savedAttempt = await this.intentoRepository.save(newAttempt);

    // Evaluamos logros y rachas con el historial ya actualizado, para
    // poder mostrar en el momento (dentro del juego) lo que se acaba de
    // desbloquear con esta partida.
    const intentosActualizados = [...student.intentos, savedAttempt];
    const logrosNuevos = await this.achievementsService.evaluarYDesbloquear(
      student,
      intentosActualizados,
    );
    const rachaDias = this.achievementsService.calcularRachaDias(
      intentosActualizados,
    );
    const rachaVictorias = this.achievementsService.calcularRachaVictorias(
      intentosActualizados,
    );

    return {
      ...savedAttempt,
      logrosNuevos,
      rachaDias,
      rachaVictorias,
    };
  }

  // 2. METODO PARA CALCULAR ESTADISTICAS
  async getStudentStats(id_discente: number) {
    const student = await this.studentRepository.findOne({
      where: { id_discente },
      relations: { intentos: true },
    });

    if (!student) throw new NotFoundException('Alumno no encontrado');

    const studentName =
      `${student.Nombre_Discente} ${student.Apellido_Paterno_Discente} ${student.Apellido_Materno_Discente}`.trim();

    const intentos = student.intentos;

    // Valores por defecto si aun no ha jugado
    if (intentos.length === 0) {
      return {
        studentName,
        avgTime: 0,
        attempts: 0,
        topEmotion: 2,
        difficulty: 2,
        totalStars: 0,
        recentSessions: [],
        nivelMapaTierra: student.NivelMapaTierra,
        nivelMapaAgua: student.NivelMapaAgua,
        streaks: { dias: 0, victorias: 0 },
        logros: await this.achievementsService.getCatalogoParaAlumno(
          student,
          [],
        ),
      };
    }

    const attemptsCount = intentos.length;

    // Calculo de Promedios
    const avgTime =
      intentos.reduce((acc, curr) => acc + curr.Tiempo, 0) / attemptsCount;
    const avgDiff = Math.round(
      intentos.reduce((acc, curr) => acc + curr.Dificultad, 0) / attemptsCount,
    );

    const totalStars = intentos.reduce((acc, curr) => acc + curr.Monedas, 0);

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

    const recentSessions = intentos.map((i) => ({
      id: i.id_intento,
      numero: i.Numero_de_intento,
      score: i.Puntos,
      emotion: i.Emocion,
      Dificultad: i.Dificultad,
      operacion: i.Operacion,
      fecha: i.Fecha,
      desglose: i.Desglose,
      vidas: i.Vidas,
      estrellas: i.Monedas,
    }));

    return {
      studentName,
      avgTime: Math.round(avgTime),
      attempts: attemptsCount,
      topEmotion: Number(topEmotion),
      difficulty: avgDiff,
      totalStars: totalStars,
      recentSessions: recentSessions.reverse(),
      nivelMapaTierra: student.NivelMapaTierra,
      nivelMapaAgua: student.NivelMapaAgua,
      streaks: {
        dias: this.achievementsService.calcularRachaDias(intentos),
        victorias: this.achievementsService.calcularRachaVictorias(intentos),
      },
      logros: await this.achievementsService.getCatalogoParaAlumno(
        student,
        intentos,
      ),
    };
  }
}
