import { DataSource, EntityTarget, ObjectLiteral } from "typeorm";
 


const construirPatron = (texto: string): string =>
  "%" +
  texto
    .toLowerCase()
    .split("")
    .map((c) => c.replace(/[%_[\]]/g, "[$&]")) // escapa comodines especiales de LIKE
    .join("%") +
  "%";

 const calcularPuntaje = (busqueda: string, texto: string): number | null => {
  const buscado = busqueda.toLowerCase();
  const candidato = texto.toLowerCase();
 
  if (candidato.includes(buscado)) return 1000; // mejor caso: aparece junto y completo
 
  let posicionAnterior = -1;
  let puntaje = 0;
 
  for (const letra of buscado) {
    const posicion = candidato.indexOf(letra, posicionAnterior + 1);
    if (posicion === -1) return null;
 
    puntaje += posicion === posicionAnterior + 1 ? 2 : 1; // +2 si va pegada a la anterior, +1 si no
    posicionAnterior = posicion;
  }
 
  return puntaje;
};
 
export async function buscarPorCaracteres<T extends ObjectLiteral>(
  dataSource: DataSource,
  entidad: EntityTarget<T>,
  columnas: (keyof T)[],
  texto: string,
  opciones: { take?: number; skip?: number; margenCandidatos?: number } = {}
): Promise<{ resultados: T[]; total: number; hayMasResultados: boolean }> {
  const { take = 20, skip = 0 } = opciones;
  // Aseguramos traer al menos suficientes candidatos para cubrir la página pedida
  const margenCandidatos = Math.max(opciones.margenCandidatos ?? 200, skip + take);
 
  const textoBuscado = texto?.trim();
  if (!textoBuscado || columnas.length === 0) {
    return { resultados: [], total: 0, hayMasResultados: false };
  }
 
  const patron = construirPatron(textoBuscado);
  const condicion = columnas.map((columna) => `LOWER(e.${String(columna)}) LIKE :patron`).join(" OR ");
 
  const queryBase = dataSource.getRepository(entidad).createQueryBuilder("e").where(condicion, { patron });
 
  // Dos consultas en paralelo: el conteo real (barato, sin traer filas) y los
  // candidatos a rankear (acotados por margenCandidatos).
  const [total, candidatos] = await Promise.all([
    queryBase.clone().getCount(),
    queryBase.clone().take(margenCandidatos).getMany(),
  ]);
 
  const resultados = candidatos
    .map((fila) => {
      const textoCompleto = columnas.map((c) => (fila[c] as unknown as string) || "").join(" ");
      return { fila, puntaje: calcularPuntaje(textoBuscado, textoCompleto) };
    })
    .filter((c): c is { fila: T; puntaje: number } => c.puntaje !== null)
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(skip, skip + take)
    .map((c) => c.fila);
 
  return { resultados, total, hayMasResultados: skip + take < total };
}
 