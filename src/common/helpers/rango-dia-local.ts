/**
 * Zona horaria del negocio (Perú, sin horario de verano). Las fechas del filtro (yyyy-mm-dd) son días de Perú,
 * pero las columnas datetime se guardan con la hora local del servidor (TypeORM usa useUTC: false): en local es
 * hora de Perú y en Azure es UTC.
 */
const OFFSET_NEGOCIO = '-05:00';

/** Inicio del día `fecha` (yyyy-mm-dd) en Perú. El driver lo pasa a la hora del servidor, igual que al guardar */
export const inicioDiaLocal = (fecha: string) => new Date(`${fecha}T00:00:00${OFFSET_NEGOCIO}`);

/** Inicio del día siguiente a `fecha` en Perú: para comparar `columna < finDiaLocal(fecha)` (fin inclusive) */
export const finDiaLocal = (fecha: string) => {
  const fin = inicioDiaLocal(fecha);
  fin.setUTCDate(fin.getUTCDate() + 1);
  return fin;
};
