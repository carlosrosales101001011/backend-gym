import { JwtService } from '@nestjs/jwt';
import { OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { JwtStrategy } from 'src/user/strategies/jwt.strategy';
import { ORIGENES_PERMITIDOS } from 'src/common/origenes-permitidos';

export type CambioAgenda = { accion: 'crear' | 'editar' | 'eliminar', id: number };

/** Avisa en vivo a todos los que tienen la agenda abierta que una cita cambió (el front vuelve a pedir la agenda) */
@WebSocketGateway({ namespace: '/agenda-nutricionista', cors: { origin: ORIGENES_PERMITIDOS, credentials: true } })
export class AgendaNutricionistaGateway implements OnGatewayInit {
  @WebSocketServer()
  private readonly server: Namespace;

  constructor(
    private readonly jwtService: JwtService,
    private readonly jwtStrategy: JwtStrategy,
  ) {}

  /** Mismo token y misma validación de usuario que JwtAuthGuard, en el handshake: si no pasa, la conexión no llega a abrirse */
  afterInit(namespace: Namespace) {
    namespace.use(async (socket, next) => {
      try {
        await this.jwtStrategy.validate(this.jwtService.verify(socket.handshake.auth?.token));
        next();
      } catch {
        next(new Error('Token invalidado'));
      }
    });
  }

  notificarCambio(cambio: CambioAgenda) {
    this.server.emit('agenda:cambio', cambio);
  }
}
