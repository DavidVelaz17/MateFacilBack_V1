import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogroAlumno } from './entities/logro-alumno.entity';
import { LOGROS } from './achievements.definitions';
import { Discente } from '../students/entities/student.entity';
import { Intento } from '../attempts/entities/attempt.entity';
import { diaLocal, diffDiasCalendario } from '../common/date.utils';

export type EstadoRacha = 'activa' | 'congelada' | 'rota';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(LogroAlumno)
    private logroRepository: Repository<LogroAlumno>,
  ) {}

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

  // tzOffsetMinutes: ver common/date.utils.ts — sin esto, una partida
  // jugada de noche cuenta en el dia UTC siguiente, no en el local.
  calcularRachaDias(intentos: Intento[], tzOffsetMinutes = 0): number {
    if (intentos.length === 0) return 0;

    const dias = Array.from(
      new Set(intentos.map((i) => diaLocal(i.Fecha, tzOffsetMinutes))),
    )
      .sort()
      .reverse();

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

  // Compara el ultimo dia jugado contra "hoy" (local, via tzOffsetMinutes)
  // para saber si la racha sigue activa, se congelo (se salto 1 dia) o se
  // rompio (2+ dias sin jugar). calcularRachaDias no lo hace: solo compara
  // dias jugados entre si, nunca contra la fecha actual.
  calcularEstadoRacha(
    intentos: Intento[],
    tzOffsetMinutes = 0,
  ): { dias: number; estado: EstadoRacha } {
    if (intentos.length === 0) return { dias: 0, estado: 'rota' };

    const ultimoDia = Array.from(
      new Set(intentos.map((i) => diaLocal(i.Fecha, tzOffsetMinutes))),
    )
      .sort()
      .reverse()[0];

    const diasSinJugar = diffDiasCalendario(
      diaLocal(new Date(), tzOffsetMinutes),
      ultimoDia,
    );

    if (diasSinJugar >= 3) return { dias: 0, estado: 'rota' };

    return {
      dias: this.calcularRachaDias(intentos, tzOffsetMinutes),
      estado: diasSinJugar <= 1 ? 'activa' : 'congelada',
    };
  }

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
