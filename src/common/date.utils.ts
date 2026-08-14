// "Fecha" es timestamp without time zone; el driver de Postgres la lee
// como UTC. Para agrupar por dia calendario local (rachas, promedios) hay
// que restar el offset antes de extraer el dia, o una partida jugada de
// noche cae en el dia UTC siguiente.
// tzOffsetMinutes = Date.prototype.getTimezoneOffset() (positivo si la
// hora local va detras de UTC). Sin el (clientes viejos), se asume 0.
export function diaLocal(fecha: Date, tzOffsetMinutes = 0): string {
  return new Date(fecha.getTime() - tzOffsetMinutes * 60000)
    .toISOString()
    .slice(0, 10);
}
