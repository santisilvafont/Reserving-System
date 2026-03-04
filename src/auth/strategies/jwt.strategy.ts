import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: { sub: string; email: string; isAdmin: boolean, type?: string }) {
    if (payload.type === 'reset-password') {
      throw new UnauthorizedException('Recovery tokens cannot be used for API access.');
    }

    return { 
      id: payload.sub, 
      email: payload.email, 
      isAdmin: payload.isAdmin 
    };
  }
}