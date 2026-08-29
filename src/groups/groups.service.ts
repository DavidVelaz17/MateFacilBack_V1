import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grupo } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AchievementsService } from '../achievements/achievements.service';
import { diaLocal } from '../common/date.utils';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Grupo)
    private groupRepository: Repository<Grupo>,
    private achievementsService: AchievementsService,
  ) {}

  create(createGroupDto: CreateGroupDto) {
    const newGroup = this.groupRepository.create(createGroupDto);
    return this.groupRepository.save(newGroup);
  }

  findAll() {
    return this.groupRepository.find();
  }

  findAllByTeacher(id_docente: number) {
    return this.groupRepository.find({
      where: {
        docente: { id_docente: id_docente },
      },
    });
  }

  findOne(id_grupo: number) {
    return this.groupRepository.findOneBy({ id_grupo });
  }

  async update(id_grupo: number, updateGroupDto: UpdateGroupDto) {
    const existing = await this.findOne(id_grupo);
    if (!existing) {
      throw new NotFoundException(`Grupo con ID ${id_grupo} no encontrado`);
    }
    await this.groupRepository.update(id_grupo, updateGroupDto);
    return this.findOne(id_grupo);
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }
    return this.groupRepository.delete(id);
  }

  async getGroupStats(id_grupo: number, tzOffsetMinutes = 0) {
    const group = await this.groupRepository.findOne({
      where: { id_grupo },
      relations: { discentes: { intentos: true } },
    });

    if (!group) {
      throw new NotFoundException(`Grupo con ID ${id_grupo} no encontrado`);
    }

    const dailyBuckets = new Map<
      string,
      {
        sumPuntos: number;
        countPuntos: number;
        sumDificultad: number;
        countDificultad: number;
      }
    >();

    const perStudent = group.discentes
      .map((discente) => {
        const intentos = discente.intentos;
        let sumPuntos = 0;
        // Dificultad=4 (modo personalizado) queda fuera de la escala
        // adaptativa 1-3: se excluye del promedio para no sesgarlo.
        let sumDificultadHistoria = 0;
        let countDificultadHistoria = 0;

        intentos.forEach((intento) => {
          sumPuntos += intento.Puntos;

          const dayKey = diaLocal(intento.Fecha, tzOffsetMinutes);
          const bucket = dailyBuckets.get(dayKey) ?? {
            sumPuntos: 0,
            countPuntos: 0,
            sumDificultad: 0,
            countDificultad: 0,
          };
          bucket.sumPuntos += intento.Puntos;
          bucket.countPuntos += 1;

          if (intento.Dificultad >= 1 && intento.Dificultad <= 3) {
            bucket.sumDificultad += intento.Dificultad;
            bucket.countDificultad += 1;
            sumDificultadHistoria += intento.Dificultad;
            countDificultadHistoria += 1;
          }
          dailyBuckets.set(dayKey, bucket);
        });

        // Sin intentos, o solo en modo custom (sin dificultad 1-3 que
        // promediar): no hay posicion valida que graficar.
        if (intentos.length === 0 || countDificultadHistoria === 0) {
          return null;
        }

        return {
          id_discente: discente.id_discente,
          nombre: `${discente.Nombre_Discente} ${discente.Apellido_Paterno_Discente}`,
          attempts: intentos.length,
          avgPuntos: Math.round(sumPuntos / intentos.length),
          avgDificultad:
            Math.round((sumDificultadHistoria / countDificultadHistoria) * 10) /
            10,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    const groupAverages = Array.from(dailyBuckets.entries())
      .map(([fecha, { sumPuntos, countPuntos, sumDificultad, countDificultad }]) => ({
        fecha,
        avgPuntos: countPuntos > 0 ? Math.round(sumPuntos / countPuntos) : 0,
        avgDificultad:
          countDificultad > 0
            ? Math.round((sumDificultad / countDificultad) * 10) / 10
            : null,
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    return { groupAverages, perStudent };
  }

  // "estado actual" reutiliza getGroupStats (sin filtrar por rango) para
  // no duplicar esa logica.
  async getGroupReport(
    id_grupo: number,
    desde: Date,
    hasta: Date,
    tzOffsetMinutes = 0,
  ) {
    const group = await this.groupRepository.findOne({
      where: { id_grupo },
      relations: { discentes: { intentos: true }, docente: true },
    });

    if (!group) {
      throw new NotFoundException(`Grupo con ID ${id_grupo} no encontrado`);
    }

    const statsActuales = await this.getGroupStats(id_grupo, tzOffsetMinutes);

    const dailyBuckets = new Map<
      string,
      { sumPuntos: number; countPuntos: number; sumDificultad: number; countDificultad: number }
    >();

    let totalIntentosPeriodo = 0;
    let alumnosActivos = 0;

    const perStudentPeriodo = group.discentes.map((discente) => {
      const intentosPeriodo = discente.intentos.filter(
        (i) => i.Fecha >= desde && i.Fecha <= hasta,
      );
      totalIntentosPeriodo += intentosPeriodo.length;
      const jugoEnPeriodo = intentosPeriodo.length > 0;
      if (jugoEnPeriodo) alumnosActivos += 1;

      const { dias: rachaDias, estado: rachaEstado } =
        this.achievementsService.calcularEstadoRacha(
          discente.intentos,
          tzOffsetMinutes,
        );

      intentosPeriodo.forEach((intento) => {
        const dayKey = diaLocal(intento.Fecha, tzOffsetMinutes);
        const bucket = dailyBuckets.get(dayKey) ?? {
          sumPuntos: 0,
          countPuntos: 0,
          sumDificultad: 0,
          countDificultad: 0,
        };
        bucket.sumPuntos += intento.Puntos;
        bucket.countPuntos += 1;
        if (intento.Dificultad >= 1 && intento.Dificultad <= 3) {
          bucket.sumDificultad += intento.Dificultad;
          bucket.countDificultad += 1;
        }
        dailyBuckets.set(dayKey, bucket);
      });

      return {
        id_discente: discente.id_discente,
        nombre: `${discente.Nombre_Discente} ${discente.Apellido_Paterno_Discente}`,
        intentosPeriodo: intentosPeriodo.length,
        avgPuntosPeriodo:
          intentosPeriodo.length > 0
            ? Math.round(
                intentosPeriodo.reduce((acc, i) => acc + i.Puntos, 0) /
                  intentosPeriodo.length,
              )
            : null,
        jugoEnPeriodo,
        rachaDias,
        rachaEstado,
        rachaVictorias: this.achievementsService.calcularRachaVictorias(
          discente.intentos,
        ),
      };
    });

    let sumPuntosTotal = 0;
    let countPuntosTotal = 0;
    let sumDificultadTotal = 0;
    let countDificultadTotal = 0;
    dailyBuckets.forEach((b) => {
      sumPuntosTotal += b.sumPuntos;
      countPuntosTotal += b.countPuntos;
      sumDificultadTotal += b.sumDificultad;
      countDificultadTotal += b.countDificultad;
    });

    const groupAveragesPeriodo = Array.from(dailyBuckets.entries())
      .map(([fecha, { sumPuntos, countPuntos, sumDificultad, countDificultad }]) => ({
        fecha,
        avgPuntos: countPuntos > 0 ? Math.round(sumPuntos / countPuntos) : 0,
        avgDificultad:
          countDificultad > 0
            ? Math.round((sumDificultad / countDificultad) * 10) / 10
            : null,
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    return {
      groupName: `${group.Grado}° ${group.Nombre_Grupo} (${group.Año})`,
      docenteName: group.docente
        ? `${group.docente.Nombre_Docente} ${group.docente.Apellido_Paterno_Docente}`
        : null,
      resumenGrupoPeriodo: {
        totalIntentos: totalIntentosPeriodo,
        alumnosActivos,
        alumnosTotal: group.discentes.length,
        avgPuntos: countPuntosTotal > 0 ? Math.round(sumPuntosTotal / countPuntosTotal) : 0,
        avgDificultad:
          countDificultadTotal > 0
            ? Math.round((sumDificultadTotal / countDificultadTotal) * 10) / 10
            : 0,
      },
      groupAveragesPeriodo,
      perStudentPeriodo,
      perStudentEstadoActual: statsActuales.perStudent,
    };
  }
}
