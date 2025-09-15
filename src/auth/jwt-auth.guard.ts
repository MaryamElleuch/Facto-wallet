import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Ce guard utilise la stratégie "jwt" pour valider le token
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
