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

  async findAll(tzOffsetMinutes = 0) {
    const students = await this.studentRepository.find({
      relations: {
        grupos: true,
        intentos: true,
      },
    });

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

    return students.map((student) => {
      const { intentos, ...studentFields } = student;
      const { dias: rachaDias, estado: rachaEstado } =
        this.achievementsService.calcularEstadoRacha(
          intentos,
          tzOffsetMinutes,
        );
      return {
        ...studentFields,
        totalStars: starsByStudent.get(student.id_discente) ?? 0,
        rachaDias,
        rachaEstado,
      };
    });
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

    // A diferencia de los demas logros, "Mundo Terrestre"/"Mundo Acuatico" no
    // se disparan al guardar un intento (saveAttempt) sino aqui, porque el
    // progreso de mapa llega en un PATCH /discentes/:id separado del
    // POST /attempts.
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

  async saveAttempt(id_discente: number, attemptData: CreateAttemptDto) {
    const student = await this.studentRepository.findOne({
      where: { id_discente },
      relations: { intentos: true },
    });

    if (!student) throw new NotFoundException('Alumno no encontrado');

    const numeroDeIntento = student.intentos.length + 1;

    // TzOffset no es una columna de Intento: se destructura aparte para no
    // guardarlo en la partida, solo se usa para calcular la racha de dias.
    const { TzOffset, ...attemptFields } = attemptData;

    const newAttempt = this.intentoRepository.create({
      ...attemptFields,
      Numero_de_intento: numeroDeIntento,
      discente: student,
    });

    const savedAttempt = await this.intentoRepository.save(newAttempt);

    const intentosActualizados = [...student.intentos, savedAttempt];
    const logrosNuevos = await this.achievementsService.evaluarYDesbloquear(
      student,
      intentosActualizados,
    );
    const { dias: rachaDias, estado: rachaEstado } =
      this.achievementsService.calcularEstadoRacha(
        intentosActualizados,
        TzOffset,
      );
    const rachaVictorias = this.achievementsService.calcularRachaVictorias(
      intentosActualizados,
    );

    return {
      ...savedAttempt,
      logrosNuevos,
      rachaDias,
      rachaEstado,
      rachaVictorias,
    };
  }

  async getStudentStats(id_discente: number, tzOffsetMinutes = 0) {
    const student = await this.studentRepository.findOne({
      where: { id_discente },
      relations: { intentos: true },
    });

    if (!student) throw new NotFoundException('Alumno no encontrado');

    const studentName =
      `${student.Nombre_Discente} ${student.Apellido_Paterno_Discente} ${student.Apellido_Materno_Discente}`.trim();

    const intentos = student.intentos;

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
        streaks: { dias: 0, estado: 'rota', victorias: 0 },
        logros: await this.achievementsService.getCatalogoParaAlumno(
          student,
          [],
        ),
      };
    }

    const attemptsCount = intentos.length;

    const avgTime =
      intentos.reduce((acc, curr) => acc + curr.Tiempo, 0) / attemptsCount;
    const avgDiff = Math.round(
      intentos.reduce((acc, curr) => acc + curr.Dificultad, 0) / attemptsCount,
    );

    const totalStars = intentos.reduce((acc, curr) => acc + curr.Monedas, 0);

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
        ...this.achievementsService.calcularEstadoRacha(
          intentos,
          tzOffsetMinutes,
        ),
        victorias: this.achievementsService.calcularRachaVictorias(intentos),
      },
      logros: await this.achievementsService.getCatalogoParaAlumno(
        student,
        intentos,
      ),
    };
  }

  private modaEmocion(intentos: Intento[]): number | null {
    if (intentos.length === 0) return null;
    const counts = intentos.reduce(
      (acc, i) => {
        acc[i.Emocion] = (acc[i.Emocion] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );
    const top = Object.keys(counts).reduce((a, b) =>
      counts[Number(a)] > counts[Number(b)] ? a : b,
    );
    return Number(top);
  }

  // estadoActual (rachas, nivel de mapa, total de logros) describe el
  // presente y deliberadamente no se filtra por [desde, hasta] como el
  // resto del reporte.
  async getStudentReport(
    id_discente: number,
    desde: Date,
    hasta: Date,
    tzOffsetMinutes = 0,
  ) {
    const student = await this.studentRepository.findOne({
      where: { id_discente },
      relations: { intentos: true, grupos: true },
    });

    if (!student) throw new NotFoundException('Alumno no encontrado');

    const studentName =
      `${student.Nombre_Discente} ${student.Apellido_Paterno_Discente} ${student.Apellido_Materno_Discente}`.trim();
    const grupos = (student.grupos || []).map(
      (g) => `${g.Grado}° ${g.Nombre_Grupo} (${g.Año})`,
    );

    const todosLosIntentos = student.intentos;
    const intentosPeriodo = todosLosIntentos.filter(
      (i) => i.Fecha >= desde && i.Fecha <= hasta,
    );
    const attemptsCount = intentosPeriodo.length;

    const resumenPeriodo =
      attemptsCount === 0
        ? { avgTime: 0, attempts: 0, avgDifficulty: 0, topEmotion: null, totalStars: 0 }
        : {
            avgTime: Math.round(
              intentosPeriodo.reduce((acc, i) => acc + i.Tiempo, 0) / attemptsCount,
            ),
            attempts: attemptsCount,
            avgDifficulty: Math.round(
              intentosPeriodo.reduce((acc, i) => acc + i.Dificultad, 0) / attemptsCount,
            ),
            topEmotion: this.modaEmocion(intentosPeriodo),
            totalStars: intentosPeriodo.reduce((acc, i) => acc + i.Monedas, 0),
          };

    const desglosePorOperacion = ['suma', 'resta', 'multiplicacion', 'division']
      .map((operacion) => {
        const deEstaOperacion = intentosPeriodo.filter((i) => i.Operacion === operacion);
        const victorias = deEstaOperacion.filter((i) => i.Puntos > 0).length;
        return {
          operacion,
          intentos: deEstaOperacion.length,
          victorias,
          porcentaje:
            deEstaOperacion.length > 0
              ? Math.round((victorias / deEstaOperacion.length) * 100)
              : 0,
        };
      })
      .filter((d) => d.intentos > 0);

    const sesionesPeriodo = [...intentosPeriodo]
      .sort((a, b) => a.Fecha.getTime() - b.Fecha.getTime())
      .map((i) => ({
        id: i.id_intento,
        fecha: i.Fecha,
        operacion: i.Operacion,
        Dificultad: i.Dificultad,
        score: i.Puntos,
        estrellas: i.Monedas,
        vidas: i.Vidas,
        emotion: i.Emocion,
      }));

    const logrosCatalogo = await this.achievementsService.getCatalogoParaAlumno(
      student,
      todosLosIntentos,
    );
    const logrosDesbloqueados = logrosCatalogo.filter((l) => l.desbloqueado);
    const logrosEnPeriodo = logrosDesbloqueados.filter(
      (l) => l.fecha && l.fecha >= desde && l.fecha <= hasta,
    );

    return {
      studentName,
      grupos,
      resumenPeriodo,
      estadoActual: {
        streaks: {
          ...this.achievementsService.calcularEstadoRacha(
            todosLosIntentos,
            tzOffsetMinutes,
          ),
          victorias: this.achievementsService.calcularRachaVictorias(todosLosIntentos),
        },
        nivelMapaTierra: student.NivelMapaTierra,
        nivelMapaAgua: student.NivelMapaAgua,
        logrosTotales: logrosDesbloqueados.length,
        logrosCatalogoTotal: logrosCatalogo.length,
      },
      logrosEnPeriodo,
      desglosePorOperacion,
      sesionesPeriodo,
    };
  }
}
