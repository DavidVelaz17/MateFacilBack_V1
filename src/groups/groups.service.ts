import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grupo } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Grupo)
    private groupRepository: Repository<Grupo>,
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

  // Avance del grupo en el tiempo: promedio diario de Puntos/Dificultad de
  // todos los alumnos del grupo, mas la posicion acumulada de cada alumno
  // (puntaje promedio x dificultad promedio historicos) para ubicar de un
  // vistazo quien necesita mas apoyo.
  async getGroupStats(id_grupo: number) {
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
        // El modo personalizado (Dificultad=4) no forma parte de la escala
        // adaptativa 1-3: se excluye del promedio de dificultad, tanto del
        // alumno como del grupo, para no sesgarlo.
        let sumDificultadHistoria = 0;
        let countDificultadHistoria = 0;

        intentos.forEach((intento) => {
          sumPuntos += intento.Puntos;

          const dayKey = intento.Fecha.toISOString().slice(0, 10);
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

        // Sin intentos, o solo intentos en modo custom (sin dificultad 1-3
        // que promediar): no hay una posicion valida que graficar.
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
}
