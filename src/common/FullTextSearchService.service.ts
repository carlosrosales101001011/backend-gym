import { Injectable } from '@nestjs/common';
import { DataSource, EntityMetadata, EntityTarget } from 'typeorm';

export type FullTextSearchWhereValue =
  | string
  | number
  | boolean
  | Date
  | null
  | (string | number)[];

export interface FullTextSearchOptions {
  /** Cuántas filas traer (equivale a pageSize). Default: 50 */
  take?: number;
  /** Cuántas filas saltar (equivale a offset). Default: 0 */
  skip?: number;
  /**
   * Filtros exactos por propiedad de la entidad (AND entre todos).
   * - undefined → se ignora
   * - null      → IS NULL
   * - array     → IN (...)
   */
  where?: Record<string, FullTextSearchWhereValue | undefined>;
}

export interface PaginatedResult<T> {
  items: T[];
  take: number;
  skip: number;
  /** Derivado de skip/take, útil para pintar un paginador */
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

@Injectable()
export class FullTextSearchService {
  /** Collation case-insensitive + accent-insensitive: "camión" matcha "camion" */
  private readonly collation = 'Latin1_General_CI_AI';

  /** Techo defensivo para que nadie pida take=100000 */
  private readonly maxTake = 200;

  /** take por defecto si no lo mandan */
  private readonly defaultTake = 50;

  constructor(private readonly dataSource: DataSource) {}

  async search<T>(
    model: EntityTarget<T>,
    columns: string[],
    search: string,
    options: FullTextSearchOptions = {},
  ): Promise<PaginatedResult<any>> {
    const take = this.normalizeTake(options.take);
    const skip = this.normalizeSkip(options.skip);

    const metadata = this.dataSource.getMetadata(model);
    const schema = metadata.schema ?? 'dbo';
    const fullTableName = `[${schema}].[${metadata.tableName}]`;

    const primaryColumn = metadata.primaryColumns[0];
    if (!primaryColumn || metadata.primaryColumns.length > 1) {
      throw new Error('Se requiere una clave primaria de una sola columna');
    }
    const keyColumn = primaryColumn.databaseName;

    const validColumns = columns
      .map(column => metadata.columns.find(col => col.propertyName === column))
      .filter((col): col is NonNullable<typeof col> => col !== undefined);

    if (!validColumns.length) {
      throw new Error('No existen columnas válidas para búsqueda');
    }

    const tokens = this.tokenize(search);
    if (!tokens.length) {
      return this.emptyResult(take, skip);
    }

    // Un solo "haystack" con todas las columnas pegadas, con espacios
    // al inicio y al final para poder detectar inicio de palabra.
    const haystack = `' ' + ${validColumns
      .map(col => `COALESCE(a.[${col.databaseName}], '')`)
      .join(` + ' ' + `)} + ' ' COLLATE ${this.collation}`;

    // Orden de parámetros: score (@0..@n), luego filtros, al final skip y take.
    const params: any[] = [];
    const scoreExpression = this.buildScore('h.txt', tokens, params);
    const whereClause = this.buildWhere(metadata, options.where, params);
    const baseParams = [...params];

    params.push(skip);
    const skipParam = `@${params.length - 1}`;
    params.push(take);
    const takeParam = `@${params.length - 1}`;

    // El WHERE va dentro del CTE: se filtra ANTES de calcular el puntaje.
    const baseCte = `
      WITH s AS (
        SELECT
          a.*,
          ${scoreExpression} AS search_rank
        FROM ${fullTableName} a
        CROSS APPLY (SELECT ${haystack} AS txt) h
        ${whereClause}
      )`;

    // COUNT(*) OVER () trae el total en la misma pasada, sin segundo query.
    const sql = `
      ${baseCte}
      SELECT
        s.*,
        COUNT(*) OVER () AS total_count
      FROM s
      WHERE s.search_rank > 0
      ORDER BY
        s.search_rank DESC,
        s.[${keyColumn}] DESC
      OFFSET ${skipParam} ROWS
      FETCH NEXT ${takeParam} ROWS ONLY
    `;

    const rows = await this.dataSource.query(sql, params);

    let total: number;
    if (rows.length) {
      total = Number(rows[0].total_count);
    } else if (skip > 0) {
      // Página fuera de rango: COUNT(*) OVER () no devuelve filas,
      // así que el total hay que pedirlo aparte.
      total = await this.count(baseCte, baseParams);
    } else {
      total = 0;
    }

    const items = rows.map(({ total_count, ...rest }: any) => rest);

    return this.buildResult(items, total, take, skip);
  }

  private async count(baseCte: string, baseParams: any[]): Promise<number> {
    const sql = `
      ${baseCte}
      SELECT COUNT(*) AS total
      FROM s
      WHERE s.search_rank > 0
    `;
    const [row] = await this.dataSource.query(sql, baseParams);
    return Number(row?.total ?? 0);
  }

  /**
   * Arma el WHERE con filtros exactos.
   * Los nombres de columna salen de la metadata de TypeORM (nunca del usuario)
   * y los valores siempre van parametrizados, así que no hay inyección SQL.
   */
  private buildWhere(
    metadata: EntityMetadata,
    where: FullTextSearchOptions['where'],
    params: any[],
  ): string {
    const conditions: string[] = [];

    for (const [property, value] of Object.entries(where ?? {})) {
      if (value === undefined) continue;

      const column = metadata.columns.find(col => col.propertyName === property);
      if (!column) {
        throw new Error(`Columna de filtro inválida: ${property}`);
      }
      const columnSql = `a.[${column.databaseName}]`;

      if (value === null) {
        conditions.push(`${columnSql} IS NULL`);
        continue;
      }

      if (Array.isArray(value)) {
        if (!value.length) {
          conditions.push('1 = 0'); // IN () vacío: no devuelve nada
          continue;
        }
        const placeholders = value.map(v => {
          params.push(v);
          return `@${params.length - 1}`;
        });
        conditions.push(`${columnSql} IN (${placeholders.join(', ')})`);
        continue;
      }

      params.push(value);
      conditions.push(`${columnSql} = @${params.length - 1}`);
    }

    return conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  }

  private normalizeTake(take?: number): number {
    const value = Math.trunc(Number(take ?? this.defaultTake));
    if (!Number.isFinite(value) || value < 1) {
      return this.defaultTake;
    }
    return Math.min(value, this.maxTake);
  }

  private normalizeSkip(skip?: number): number {
    const value = Math.trunc(Number(skip ?? 0));
    if (!Number.isFinite(value) || value < 0) {
      return 0;
    }
    return value;
  }

  private buildResult(
    items: any[],
    total: number,
    take: number,
    skip: number,
  ): PaginatedResult<any> {
    return {
      items,
      take,
      skip,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      total,
      totalPages: Math.ceil(total / take),
      hasPrevious: skip > 0,
      hasNext: skip + items.length < total,
    };
  }

  private emptyResult(take: number, skip: number): PaginatedResult<any> {
    return this.buildResult([], 0, take, skip);
  }

  private tokenize(search: string): string[] {
    return (search ?? '')
      .toLowerCase()
      // caracteres que son comodines de LIKE o rompen la query
      .replace(/[%_\[\]'"]/g, ' ')
      .split(/\s+/)
      .map(token => token.trim())
      .filter(Boolean)
      .slice(0, 8); // techo para no generar una query gigante
  }

  /**
   * Por cada palabra buscada genera prefijos descendentes y devuelve
   * el puntaje del prefijo más largo que aparezca en el texto.
   * Inicio de palabra vale el doble que coincidencia en medio.
   */
  private buildScore(
    column: string,
    tokens: string[],
    params: any[],
  ): string {
    const perToken = tokens.map(token => {
      const branches: string[] = [];
      // "caminadora" -> caminadora, caminador, caminado, caminad, camina
      const minLength = Math.max(1, Math.ceil(token.length / 2));

      for (let length = token.length; length >= minLength; length--) {
        const prefix = token.slice(0, length);

        // inicio de palabra
        params.push(`% ${prefix}%`);
        branches.push(
          `WHEN ${column} LIKE @${params.length - 1} THEN ${prefix.length * 2}`,
        );

        // en medio de una palabra
        params.push(`%${prefix}%`);
        branches.push(
          `WHEN ${column} LIKE @${params.length - 1} THEN ${prefix.length}`,
        );
      }

      return `CASE ${branches.join(' ')} ELSE 0 END`;
    });

    // bonus fuerte si aparece la frase completa tal cual
    const phrase = tokens.join(' ');
    params.push(`%${phrase}%`);
    perToken.push(
      `CASE WHEN ${column} LIKE @${params.length - 1} THEN ${phrase.length * 5} ELSE 0 END`,
    );

    return perToken.join(' + ');
  }
}