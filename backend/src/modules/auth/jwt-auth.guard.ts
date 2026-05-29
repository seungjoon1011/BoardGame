import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export type AuthenticatedRequest = Request & {
  user: {
    id: number;
    email: string;
  };
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwtService = new JwtService({ secret: 'secretKey' });

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    try {
      const payload = this.jwtService.verify<{ sub: number; email: string }>(
        token,
      );
      request.user = {
        id: payload.sub,
        email: payload.email,
      };
      return true;
    } catch {
      throw new UnauthorizedException('인증 정보가 유효하지 않습니다.');
    }
  }
}
