import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogroAlumno } from './entities/logro-alumno.entity';
import { LOGROS } from './achievements.definitions';
import { Discente } from '../students/entities/student.entity';
import { Intento } from '../attempts/entities/attempt.entity';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(LogroAlumno)
    private logroRepository: Repository<LogroAlumno>,
  ) {}

  // Catalogo completo (desbloqueados + bloqueados con su progreso) para
  // mostrar en el dashboard del docente. Solo lectura.
  async getCatalogoParaAlumno(discente: Discente, intentos: Intento[]) {
    const desbloqueados = await this.logroRepository.find({
      where: { discente: { id_discente: discente.id_discente } },
    });
    const fechaPorCodigo = new Map(
      desbloqueados.map((l) => [l.Codigo, l.FechaDesbloqueado]),
    );
    const ctx = { intentos, discente };

    return LOGROS.map((def) => {
      const fecha = fechaPorCodigo.get(def.codigo) ?? null;
      return {
        codigo: def.codigo,
        nombre: def.nombre,
        descripcion: def.descripcion,
        icono: def.icono,
        desbloqueado: !!fecha,
        fecha,
        progreso: !fecha && def.progreso ? def.progreso(ctx) : null,
      };
    });
  }

  // Se llama justo despues de guardar un intento nuevo (StudentsService.
  // saveAttempt). Evalua el catalogo completo contra el historial ya
  // actualizado y persiste los que se cumplen por primera vez. Devuelve
  // solo los recien desbloqueados, para mostrarlos en el momento.
  async evaluarYDesbloquear(discente: Discente, intentos: Intento[]) {
    const desbloqueados = await this.logroRepository.find({
      where: { discente: { id_discente: discente.id_discente } },
    });
    const codigosDesbloqueados = new Set(desbloqueados.map((l) => l.Codigo));
    const ctx = { intentos, discente };

    const nuevos = LOGROS.filter(
      (def) => !codigosDesbloqueados.has(def.codigo) && def.cumplido(ctx),
    );

    if (nuevos.length === 0) return [];

    await this.logroRepository.save(
      nuevos.map((def) =>
        this.logroRepository.create({ Codigo: def.codigo, discente }),
      ),
    );

    return nuevos.map((def) => ({
      codigo: def.codigo,
      nombre: def.nombre,
      descripcion: def.descripcion,
      icono: def.icono,
    }));
  }

  // Racha "en vivo": dias consecutivos con al menos un intento, contando
  // hacia atras desde la fecha del intento mas reciente (no
  // necesariamente hoy). No se guarda en ningun lado.
  calcularRachaDias(intentos: Intento[]): number {
    if (intentos.length === 0) return 0;

    const dias = Array.from(
      new Set(intentos.map((i) => i.Fecha.toISOString().slice(0, 10))),
    )
      .sort()
      .reverse(); // mas reciente primero

    let racha = 1;
    for (let idx = 0; idx < dias.length - 1; idx++) {
      const diffDias = Math.round(
        (new Date(dias[idx]).getTime() - new Date(dias[idx + 1]).getTime()) /
          86400000,
      );
      if (diffDias === 1) {
        racha++;
      } else {
        break;
      }
    }
    return racha;
  }

  // Racha "en vivo": victorias consecutivas contando hacia atras desde el
  // intento mas reciente por Numero_de_intento.
  calcularRachaVictorias(intentos: Intento[]): number {
    const ordenados = [...intentos].sort(
      (a, b) => b.Numero_de_intento - a.Numero_de_intento,
    );

    let racha = 0;
    for (const intento of ordenados) {
      if (intento.Puntos > 0) {
        racha++;
      } else {
        break;
      }
    }
    return racha;
  }
}
