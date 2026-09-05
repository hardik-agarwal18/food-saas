import { injectable } from 'tsyringe';
import { IJwtService } from '../../../domain/services/jwt.service.js';
import { JwtTokenFactory } from './jwt.token-factory.js';
import { JWTTokenVerifier } from './jwt.token-verifier.js';
import { env } from '../../../../../config/env.config.js';
import { IJwtConfig } from './jwt.types.js';
import { ITokenPayload } from '../../../domain/services/token-payload.js';

@injectable()
export class JwtService implements IJwtService {
  private readonly tokenFactory: JwtTokenFactory;
  private readonly tokenVerifier: JWTTokenVerifier;

  constructor() {
    const config: IJwtConfig = {
      accessTokenSecret: env.JWT_ACCESS_SECRET,
      refreshTokenSecret: env.JWT_REFRESH_SECRET,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      accessTokenExpiresIn: Number(env.JWT_ACCESS_EXPIRES_IN ?? 900),
      refreshTokenExpiresIn: Number(env.JWT_REFRESH_EXPIRES_IN ?? 604800),
    };

    this.tokenFactory = new JwtTokenFactory(config);
    this.tokenVerifier = new JWTTokenVerifier(config);
  }

  async signAccessToken(tokenPayload: ITokenPayload): Promise<string> {
    return this.tokenFactory.createAccessToken(tokenPayload);
  }

  async signRefreshToken(tokenPayload: ITokenPayload): Promise<string> {
    return this.tokenFactory.createRefreshToken(tokenPayload);
  }

  async verifyAccessToken(accessToken: string): Promise<ITokenPayload> {
    return this.tokenVerifier.verifyAccessToken(accessToken);
  }

  async verifyRefreshToken(refreshToken: string): Promise<ITokenPayload> {
    return this.tokenVerifier.verifyRefreshToken(refreshToken);
  }
}
