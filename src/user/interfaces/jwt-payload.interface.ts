export interface JwtPayload{
    /** Identifica al usuario (siempre existe; el email ya no es obligatorio) */
    uuid?:string;
    /** Solo en tokens emitidos antes del cambio a uuid */
    email?:string;

    //TODO: TODO LO QUE SE QUIERA GRABAR
}