import { IsBoolean } from 'class-validator';

/** PATCH /modulo-x-user/me/id/:id/fijado: chincheta del módulo en el Home */
export class CambiarFijadoDto {
  @IsBoolean()
  is_fijado!: boolean;
}
