import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // lit le token dans "Authorization: Bearer ..."
      ignoreExpiration: false, // rejette si expiré
      secretOrKey: 'TA_CLE_SECRETE', // à mettre dans .env
    });
  }

  async validate(payload: any) {
    // Ce que tu retournes ici sera accessible via req.user
    return { id: payload.sub, username: payload.username };
  }
}
