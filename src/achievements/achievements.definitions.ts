import { Intento } from '../attempts/entities/attempt.entity';
import { LogroDefinicion } from './achievements.types';

// 5 puntos en el mapa, igual que MapConfig.pointDataTierra/Agua en el
// frontend (patterns.tsx). Duplicado porque backend y frontend no
// comparten codigo.
const TOTAL_NIVELES_MUNDO = 5;

function fallosAntesDeExito(intento: Intento): number {
  const subIntentos = intento.Desglose?.intentos;
  if (!subIntentos || subIntentos.length === 0) return 0;
  const idx = subIntentos.findIndex((sub) => sub.exitoso);
  return idx === -1 ? 0 : idx;
}

function victoriasPorOperacion(intentos: Intento[], operacion: string): number {
  return intentos.filter((i) => i.Operacion === operacion && i.Puntos > 0).length;
}

function ordenarPorIntento(intentos: Intento[]): Intento[] {
  return [...intentos].sort((a, b) => a.Numero_de_intento - b.Numero_de_intento);
}

function ordenarPorFecha(intentos: Intento[]): Intento[] {
  return [...intentos].sort((a, b) => a.Fecha.getTime() - b.Fecha.getTime());
}

// Compartida por "Nunca te rindes" (solo que haya vuelto a jugar) y
// "Remontada" (que ademas la haya ganado).
function indicePartidaTrasTresDerrotas(intentosOrdenados: Intento[]): number | null {
  for (let i = 0; i + 3 < intentosOrdenados.length; i++) {
    const ventana = intentosOrdenados.slice(i, i + 3);
    if (ventana.every((x) => x.Puntos === 0)) {
      return i + 3;
    }
  }
  return null;
}

function huboRegresoTrasPausa(intentos: Intento[], diasMinimos: number): boolean {
  const ordenados = ordenarPorFecha(intentos);
  for (let i = 1; i < ordenados.length; i++) {
    const diffDias =
      (ordenados[i].Fecha.getTime() - ordenados[i - 1].Fecha.getTime()) /
      86400000;
    if (diffDias >= diasMinimos && ordenados[i].Puntos > 0) {
      return true;
    }
  }
  return false;
}

function huboSaltoDeMejora(
  intentos: Intento[],
  umbralBajo: number,
  saltoMinimo: number,
): boolean {
  const porOperacion = new Map<string, Intento[]>();
  for (const intento of ordenarPorIntento(intentos)) {
    if (!intento.Operacion) continue;
    const lista = porOperacion.get(intento.Operacion) ?? [];
    lista.push(intento);
    porOperacion.set(intento.Operacion, lista);
  }

  for (const lista of porOperacion.values()) {
    for (let i = 1; i < lista.length; i++) {
      if (
        lista[i - 1].Puntos < umbralBajo &&
        lista[i].Puntos >= lista[i - 1].Puntos + saltoMinimo
      ) {
        return true;
      }
    }
  }
  return false;
}

// A diferencia de "Primera Perfecta" (ganar a la primera), aqui se exige
// haber fallado al menos una vez antes de ganar.
function victoriasTrabajadas(intentos: Intento[]): number {
  return intentos.filter((i) => i.Puntos > 0 && fallosAntesDeExito(i) >= 1)
    .length;
}

const VICTORIAS_PARA_MAESTRO = 20;
const VICTORIAS_A_PULSO = 15;

function maestroDeOperacion(
  codigo: string,
  nombre: string,
  operacion: string,
  icono: string,
): LogroDefinicion {
  return {
    codigo,
    nombre,
    descripcion: `${VICTORIAS_PARA_MAESTRO} victorias en ${operacion}`,
    icono,
    cumplido: (ctx) =>
      victoriasPorOperacion(ctx.intentos, operacion) >= VICTORIAS_PARA_MAESTRO,
    progreso: (ctx) => ({
      actual: Math.min(
        victoriasPorOperacion(ctx.intentos, operacion),
        VICTORIAS_PARA_MAESTRO,
      ),
      total: VICTORIAS_PARA_MAESTRO,
    }),
  };
}

export const LOGROS: LogroDefinicion[] = [
  {
    codigo: 'primera_perfecta',
    nombre: 'Primera Perfecta',
    descripcion: 'Ganó una partida con las 3 estrellas',
    icono: '🥇',
    cumplido: (ctx) => ctx.intentos.some((i) => i.Monedas === 3),
  },
  {
    codigo: 'sin_rasgunos',
    nombre: 'Sin Rasguños',
    descripcion: 'Ganó sin perder ninguna vida',
    icono: '🛡️',
    cumplido: (ctx) => ctx.intentos.some((i) => i.Puntos > 0 && i.Vidas === 3),
  },
  {
    codigo: 'segunda_oportunidad',
    nombre: 'Segunda Oportunidad',
    descripcion: 'Ganó después de perder 2 vidas',
    icono: '🔁',
    cumplido: (ctx) => ctx.intentos.some((i) => fallosAntesDeExito(i) >= 2),
  },
  maestroDeOperacion('maestro_suma', 'Maestro de la Suma', 'suma', '➕'),
  maestroDeOperacion('maestro_resta', 'Maestro de la Resta', 'resta', '➖'),
  maestroDeOperacion(
    'maestro_multiplicacion',
    'Maestro de la Multiplicación',
    'multiplicacion',
    '✖️',
  ),
  maestroDeOperacion('maestro_division', 'Maestro de la División', 'division', '➗'),
  {
    codigo: 'mundo_terrestre',
    nombre: 'Mundo Terrestre',
    descripcion: 'Completó todos los niveles del mundo terrestre',
    icono: '🌎',
    cumplido: (ctx) => ctx.discente.NivelMapaTierra >= TOTAL_NIVELES_MUNDO,
    progreso: (ctx) => ({
      actual: Math.min(ctx.discente.NivelMapaTierra, TOTAL_NIVELES_MUNDO),
      total: TOTAL_NIVELES_MUNDO,
    }),
  },
  {
    codigo: 'mundo_acuatico',
    nombre: 'Mundo Acuático',
    descripcion: 'Completó todos los niveles del mundo acuático',
    icono: '🌊',
    cumplido: (ctx) => ctx.discente.NivelMapaAgua >= TOTAL_NIVELES_MUNDO,
    progreso: (ctx) => ({
      actual: Math.min(ctx.discente.NivelMapaAgua, TOTAL_NIVELES_MUNDO),
      total: TOTAL_NIVELES_MUNDO,
    }),
  },
  {
    codigo: 'rayo',
    nombre: 'Rayo',
    descripcion: 'Ganó una partida en menos de 15 segundos',
    icono: '⚡',
    cumplido: (ctx) => ctx.intentos.some((i) => i.Puntos > 0 && i.Tiempo <= 15),
  },

  {
    codigo: 'nunca_te_rindes',
    nombre: 'Nunca te Rindes',
    descripcion: 'Jugó de nuevo después de perder 3 partidas seguidas',
    icono: '💪',
    cumplido: (ctx) =>
      indicePartidaTrasTresDerrotas(ordenarPorIntento(ctx.intentos)) !== null,
  },
  {
    codigo: 'remontada',
    nombre: 'Remontada',
    descripcion: 'Ganó justo después de perder 3 partidas seguidas',
    icono: '📈',
    cumplido: (ctx) => {
      const ordenados = ordenarPorIntento(ctx.intentos);
      const idx = indicePartidaTrasTresDerrotas(ordenados);
      return idx !== null && ordenados[idx].Puntos > 0;
    },
  },
  {
    codigo: 'vuelta_al_ruedo',
    nombre: 'De Vuelta al Ruedo',
    descripcion: 'Volvió a ganar después de una pausa de 3 días o más',
    icono: '🔄',
    cumplido: (ctx) => huboRegresoTrasPausa(ctx.intentos, 3),
  },
  {
    codigo: 'supero_su_marca',
    nombre: 'Superó su Marca',
    descripcion: 'Mejoró su puntaje 30+ puntos tras una partida floja',
    icono: '🚀',
    cumplido: (ctx) => huboSaltoDeMejora(ctx.intentos, 40, 30),
  },
  {
    codigo: 'a_pulso',
    nombre: 'A Pulso',
    descripcion: `${VICTORIAS_A_PULSO} victorias en las que perdió al menos una vida antes de ganar`,
    icono: '🏗️',
    cumplido: (ctx) => victoriasTrabajadas(ctx.intentos) >= VICTORIAS_A_PULSO,
    progreso: (ctx) => ({
      actual: Math.min(victoriasTrabajadas(ctx.intentos), VICTORIAS_A_PULSO),
      total: VICTORIAS_A_PULSO,
    }),
  },
];
