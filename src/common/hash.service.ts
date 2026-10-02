import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class HashService {

  // 🔐 Encriptar contraseña
  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id, // el más seguro (mezcla argon2i + argon2d)
      memoryCost: 2 ** 16,   // 64 MB
      timeCost: 3,           // iteraciones
      parallelism: 1,        // hilos
    });
  }

  // 🔍 Comparar contraseña (false si lo guardado no es un hash válido)
  async compare(password: string, hashed: string): Promise<boolean> {
    try {
      return await argon2.verify(hashed, password);
    } catch {
      return false;
    }
  }

  /** true si el valor guardado ya es un hash de argon2 (los usuarios antiguos tienen la contraseña sin cifrar) */
  esHash(valor: string): boolean {
    return typeof valor === 'string' && valor.startsWith('$argon2');
  }

  /** Compara dos textos en tiempo constante (para contraseñas antiguas guardadas sin cifrar) */
  igualesSinCifrar(password: string, guardada: string): boolean {
    const a = Buffer.from(password ?? '');
    const b = Buffer.from(guardada ?? '');
    return a.length === b.length && timingSafeEqual(a, b);
  }
}