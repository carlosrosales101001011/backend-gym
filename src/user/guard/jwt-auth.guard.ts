// auth/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // 👇 esto nos dice exactamente qué está fallando
    console.log('errsaaaaaaaaa:');
    console.log('user:', user);
    // console.log('info:', info); // aquí está el error real
    if (err || !user) throw err || new UnauthorizedException();
    return user;
  }
}