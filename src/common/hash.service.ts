import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

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

  // 🔍 Comparar contraseña
  async compare(password: string, hashed: string): Promise<boolean> {
    return argon2.verify(hashed, password);
  }
}