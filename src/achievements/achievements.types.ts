import { Intento } from '../attempts/entities/attempt.entity';
import { Discente } from '../students/entities/student.entity';

export interface LogroContext {
  // Incluye el intento recien guardado cuando se evalua justo despues de
  // una partida.
  intentos: Intento[];
  discente: Discente;
}

export interface LogroProgreso {
  actual: number;
  total: number;
}

export interface LogroDefinicion {
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  cumplido: (ctx: LogroContext) => boolean;
  // Solo para logros bloqueados con progreso mostrable (ej. "12/20").
  progreso?: (ctx: LogroContext) => LogroProgreso;
}
