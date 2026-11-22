import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAuditoria } from './entities/user-auditoria.entity';
import { ACCION_AUDITORIA, AccionAuditoria, BaseAuditoriaDto, DatosAuditoria } from './dto/create-user-auditoria.dto';

/** Propiedades que cambian solas en cada guardado y no son un cambio del usuario */
const PROPIEDADES_IGNORADAS = new Set(['updatedAt', 'updated_at', 'createdAt', 'created_at']);

/** Valor comparable/serializable: fechas a ISO, objetos a JSON, undefined a null */
const normalizar = (valor: unknown): unknown => {
  if (valor === undefined || valor === null) return null;
  if (valor instanceof Date) return valor.toISOString();
  if (typeof valor === 'object') return JSON.stringify(valor);
  return valor;
};

/** Iguales aunque uno venga como texto: 70 y '70.00' (DECIMAL de mssql) cuentan como iguales */
const sonIguales = (a: unknown, b: unknown): boolean => {
  const na = normalizar(a);
  const nb = normalizar(b);
  if (na === nb) return true;
  if (na === null || nb === null || na === '' || nb === '') return false;
  const numA = Number(na);
  const numB = Number(nb);
  return !Number.isNaN(numA) && !Number.isNaN(numB) && numA === numB;
};

/** { a: 1, b: 2 } → [{ a: 1 }, { b: 2 }] */
const aListaPropiedades = (datos: DatosAuditoria) =>
  Object.entries(datos as Record<string, unknown>)
    .filter(([propiedad]) => !PROPIEDADES_IGNORADAS.has(propiedad))
    .map(([propiedad, valor]) => ({ [propiedad]: normalizar(valor) }));

/**
 * Auditoría interna: los demás servicios llaman a registrarCreate/Read/Update/Delete después de cada acción.
 * Si falla el registro solo se loguea: la auditoría no debe tumbar la operación principal.
 */
@Injectable()
export class UserAuditoriaService {
  private readonly logger = new Logger('UserAuditoriaService');

  constructor(
    @InjectRepository(UserAuditoria)
    private readonly auditoriaRepository: Repository<UserAuditoria>,
  ) {}

  /** Create: datos_nuevos = [{ propiedad: valor }] del registro creado */
  registrarCreate(base: BaseAuditoriaDto, creado: DatosAuditoria) {
    return this.registrar(ACCION_AUDITORIA.CREATE, base, null, aListaPropiedades(creado));
  }

  /** Login: quién entró al sistema (id_registro = su id de usuario) */
  registrarLogin(base: BaseAuditoriaDto) {
    return this.registrar(ACCION_AUDITORIA.LOGIN, base, null, null);
  }

  /** Read: solo quién leyó qué (sin datos) */
  registrarRead(base: BaseAuditoriaDto) {
    return this.registrar(ACCION_AUDITORIA.READ, base, null, null);
  }

  /**
   * Update: compara el registro antes y después y guarda solo las propiedades que cambiaron,
   * datos_anteriores = [{ propiedad: valor_anterior }] y datos_nuevos = [{ propiedad: valor_nuevo }].
   * Se comparan las propiedades de `despues` (lo que se actualizó). Si nada cambió no se registra.
   */
  registrarUpdate(base: BaseAuditoriaDto, datosAntes: DatosAuditoria, datosDespues: DatosAuditoria) {
    const antes = datosAntes as Record<string, unknown>;
    const despues = datosDespues as Record<string, unknown>;
    const alteradas = Object.keys(despues)
      .filter((propiedad) => !PROPIEDADES_IGNORADAS.has(propiedad) && !sonIguales(antes[propiedad], despues[propiedad]));
    if (!alteradas.length) return Promise.resolve(null);
    return this.registrar(
      ACCION_AUDITORIA.UPDATE,
      base,
      alteradas.map((propiedad) => ({ [propiedad]: normalizar(antes[propiedad]) })),
      alteradas.map((propiedad) => ({ [propiedad]: normalizar(despues[propiedad]) })),
    );
  }

  /** Delete: datos_anteriores y datos_nuevos = [{ propiedad: valor }] del registro eliminado completo */
  registrarDelete(base: BaseAuditoriaDto, eliminado: DatosAuditoria) {
    const datos = aListaPropiedades(eliminado);
    return this.registrar(ACCION_AUDITORIA.DELETE, base, datos, datos);
  }

  /** Últimas 50 actividades del usuario (la más reciente primero); con idAccion, solo las de esa acción */
  misActividades(idUser: number, idAccion?: number) {
    return this.auditoriaRepository.find({
      where: { id_user: idUser, ...(idAccion ? { id_accion_realizada: idAccion } : {}) },
      order: { fecha: 'DESC', id: 'DESC' },
      take: 50,
    });
  }

  private async registrar(
    idAccion: AccionAuditoria,
    { id_user, tabla, id_registro, ip, resultado }: BaseAuditoriaDto,
    anteriores: Record<string, unknown>[] | null,
    nuevos: Record<string, unknown>[] | null,
  ) {
    try {
      return await this.auditoriaRepository.save(this.auditoriaRepository.create({
        id_user,
        tabla,
        id_registro: id_registro ?? null,
        ip: ip ?? '',
        resultado: resultado ?? '',
        id_accion_realizada: idAccion,
        datos_anteriores: anteriores ? JSON.stringify(anteriores) : null,
        datos_nuevos: nuevos ? JSON.stringify(nuevos) : null,
      }));
    } catch (error) {
      this.logger.error(`No se pudo registrar la auditoría (${idAccion} ${tabla} #${id_registro ?? '-'})`, error);
      return null;
    }
  }
}
