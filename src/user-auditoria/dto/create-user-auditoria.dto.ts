/** Ids de id_accion_realizada */
export const ACCION_AUDITORIA = {
  CREATE: 6200,
  READ: 6201,
  UPDATE: 6202,
  DELETE: 6203,
  LOGIN: 6204,
} as const;

export type AccionAuditoria = typeof ACCION_AUDITORIA[keyof typeof ACCION_AUDITORIA];

/** Quién hizo la acción y desde dónde (lo arma el decorador @Auditor() en el controller) */
export type ContextoAuditoria = {
  id_user: number;
  ip?: string;
};

/** Datos comunes de cualquier registro de auditoría */
export type BaseAuditoriaDto = ContextoAuditoria & {
  /** Entidad/tabla afectada (ej. 'perfil_nutricional') */
  tabla: string;
  id_registro?: number | null;
  resultado?: string;
};

/** Fila con sus propiedades (registro antes/después de la acción): cualquier entidad u objeto plano */
export type DatosAuditoria = object;
