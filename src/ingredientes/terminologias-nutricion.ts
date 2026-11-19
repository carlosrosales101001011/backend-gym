import { BadRequestException } from "@nestjs/common";
import { In, Repository } from "typeorm";
import { Terminologia } from "src/terminologia/entities/terminologia.entity";

/** Terna (entidad / grupo / subgrupo) que identifica un catálogo en la tabla terminologia */
type TernaTerminologia = { entidad: string, grupo: string, subgrupo: string };

/** Unidades de medida de los ingredientes (g, taza, cucharada...) */
export const TERMINOLOGIA_UNIDAD: TernaTerminologia = { entidad: 'nutricion', grupo: 'ingrediente', subgrupo: 'unidad' };

/** Alérgenos de los ingredientes (gluten, lácteos, maní...) */
export const TERMINOLOGIA_ALERGENO: TernaTerminologia = { entidad: 'nutricion', grupo: 'ingrediente', subgrupo: 'alergeno' };

/**
 * Valida que todos los ids sean terminologías activas de ESA terna (así no se cuela, por ejemplo,
 * el id de un estado como si fuera una unidad) y devuelve un mapa id → valor para llenar los label_*.
 */
export async function valoresDeTerminologia(
    terminologiaRepository: Repository<Terminologia>,
    ids: number[],
    terna: TernaTerminologia,
    nombreCatalogo: string,
): Promise<Map<number, string>> {
    const idsUnicos = [...new Set(ids)];
    if (idsUnicos.length === 0) return new Map();

    const encontrados = await terminologiaRepository.find({
        where: { id: In(idsUnicos), ...terna, flag: true },
        select: { id: true, valor: true },
    });
    if (encontrados.length !== idsUnicos.length) {
        throw new BadRequestException(`Hay ${nombreCatalogo} que no existen o no son válidos`);
    }
    return new Map(encontrados.map((t) => [t.id, t.valor]));
}

/** Redondea a 2 decimales (lo que guardan las columnas decimal(_, 2)) */
export const redondear2 = (valor: number) => Math.round(valor * 100) / 100;

/** Error de SQL Server por clave duplicada (unique / primary key) */
export const esClaveDuplicada = (error: any) => error?.number === 2627 || error?.number === 2601;
