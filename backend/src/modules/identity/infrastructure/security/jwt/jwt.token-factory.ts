import { randomUUID } from 'crypto';
import { SignJWT } from 'jose';

import { TokenType } from '../../../domain/enums/index.js';
import { ITokenPayload } from '../../../domain/services/index.js';
import { IJwtConfig } from './jwt.types.js';

export class JwtTokenFactory {
  constructor(private readonly config: IJwtConfig) {}

  private getSecret(type: TokenType): Uint8Array {
    const secret =
      type === TokenType.ACCESS ? this.config.accessTokenSecret : this.config.refreshTokenSecret;

    return new TextEncoder().encode(secret);
  }

  private async createToken(
    payload: { sub: string; roles?: string[]; type: TokenType },
    expiresIn: number,
  ): Promise<string> {
    const secret = this.getSecret(payload.type);
    const now = Math.floor(Date.now() / 1000);

    return new SignJWT({
      roles: payload.roles,
      type: payload.type,
    })
      .setProtectedHeader({
        alg: 'HS256',
        typ: 'JWT',
      })
      .setJti(randomUUID())
      .setSubject(payload.sub)
      .setIssuer(this.config.issuer)
      .setAudience(this.config.audience)
      .setIssuedAt(now)
      .setExpirationTime(now + expiresIn)
      .sign(secret);
  }

  async createAccessToken(payload: ITokenPayload): Promise<string> {
    return this.createToken(
      {
        sub: payload.sub,
        roles: payload.roles,
        type: TokenType.ACCESS,
      },
      this.config.accessTokenExpiresIn,
    );
  }

  async createRefreshToken(payload: ITokenPayload): Promise<string> {
    return this.createToken(
      {
        sub: payload.sub,
        roles: payload.roles,
        type: TokenType.REFRESH,
      },
      this.config.refreshTokenExpiresIn,
    );
  }
}
