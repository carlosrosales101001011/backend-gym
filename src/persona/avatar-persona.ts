import { In, Repository } from 'typeorm';
import { Persona } from './entities/persona.entity';

/** Foto de una persona para mostrarla (la última imagen y su encuadre); null si no tiene */
export type AvatarPersona = {
  url_avatar_ultimo: string;
  avatar_x_ultimo: number | null;
  avatar_y_ultimo: number | null;
  avatar_zoom_ultimo: number | null;
} | null;

/**
 * Fotos de varias personas por id (ej. el colaborador de cada usuario: users.id_empl).
 * Las que no tienen foto quedan fuera del Map.
 */
export const avataresPorPersona = async (personaRepository: Repository<Persona>, ids: (number | undefined | null)[]) => {
  const idsValidos = [...new Set(ids.filter((id): id is number => !!id))];
  if (!idsValidos.length) return new Map<number, NonNullable<AvatarPersona>>();
  const personas = await personaRepository.find({
    where: { id: In(idsValidos) },
    select: { id: true, url_avatar_ultimo: true, avatar_x_ultimo: true, avatar_y_ultimo: true, avatar_zoom_ultimo: true },
  });
  return new Map(personas
    .filter((p) => p.url_avatar_ultimo)
    .map((p) => [p.id!, {
      url_avatar_ultimo: p.url_avatar_ultimo!,
      avatar_x_ultimo: p.avatar_x_ultimo ?? null,
      avatar_y_ultimo: p.avatar_y_ultimo ?? null,
      avatar_zoom_ultimo: p.avatar_zoom_ultimo ?? null,
    }]));
};
