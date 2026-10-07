import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../entities/user.entity';

/** Campos de auditoría de quién crea un registro (se guardan tal cual en la entidad) */
export type UsuarioCreador = {
  id_usercreated: number;
  label_nombres_apellidos_usercreated: string;
};

/**
 * Usuario logueado listo para guardar como creador de un registro: { id_usercreated, label_nombres_apellidos_usercreated }.
 * Sale del usuario que deja el JwtAuthGuard (JwtStrategy trae id, nombres y apellidos): va siempre junto a @UseGuards(JwtAuthGuard).
 * Ej: create(@Body() dto: CreateXDto, @UsuarioCreador() creador: UsuarioCreador) { return this.service.create({ ...dto, ...creador }) }
 */
export const UsuarioCreador = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioCreador => {
    const user: User = ctx.switchToHttp().getRequest().user;
    return {
      id_usercreated: user.id,
      label_nombres_apellidos_usercreated: `${user.nombres ?? ''} ${user.apellidos ?? ''}`.replace(/\s+/g, ' ').trim(),
    };
  },
);
