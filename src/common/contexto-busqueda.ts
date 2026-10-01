import { AsyncLocalStorage } from 'async_hooks';
import type { NextFunction, Request, Response } from 'express';

/**
 * Columnas pedidas por el front para el buscador (?columnas=nombres,telefono) durante la request actual.
 * Las lee FullTextSearchService.search sin que cada servicio tenga que pasarlas.
 */
type ContextoBusqueda = { columnas: string[] };

const almacen = new AsyncLocalStorage<ContextoBusqueda>();

/** "nombres, telefono" o ['nombres', 'telefono'] → ['nombres', 'telefono'] (sin vacíos ni repetidos, máx. 30) */
const parsearColumnas = (valor: unknown): string[] => {
  const crudo = Array.isArray(valor) ? valor.join(',') : typeof valor === 'string' ? valor : '';
  return [...new Set(crudo.split(',').map((c) => c.trim()).filter(Boolean))].slice(0, 30);
};

/** Middleware global (main.ts): guarda las columnas pedidas de la request */
export const middlewareContextoBusqueda = (req: Request, _res: Response, next: NextFunction) => {
  almacen.run({ columnas: parsearColumnas(req.query?.columnas) }, next);
};

/** Columnas pedidas en la request actual; [] = buscar en todas las permitidas */
export const columnasBusquedaPedidas = (): string[] => almacen.getStore()?.columnas ?? [];
