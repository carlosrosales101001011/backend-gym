import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ContextoAuditoria } from '../dto/create-user-auditoria.dto';

/** Usuario de la sesión (requiere JwtAuthGuard) e IP del request, para pasárselos a la auditoría */
export const Auditor = createParamDecorator((_data: unknown, ctx: ExecutionContext): ContextoAuditoria => {
  const request = ctx.switchToHttp().getRequest();
  return { id_user: request.user?.id ?? 0, ip: request.ip ?? '' };
});
