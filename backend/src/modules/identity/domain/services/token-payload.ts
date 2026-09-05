import { TokenType, Role } from '../enums/index.js';

export interface ITokenPayload {
  sub: string;
  roles: Role[];
  type: TokenType;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}
