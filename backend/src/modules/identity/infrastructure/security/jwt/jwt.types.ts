import { TokenType } from '../../../domain/enums/token-type.enum.js';

export interface IJwtConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  issuer: string;
  audience: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

export interface IJwtClaims {
  sub: string;
  roles?: string[];
  type: TokenType;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}
