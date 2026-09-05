import { ITokenPayload } from './token-payload.js';

export interface IJwtService {
  signAccessToken(TokenPayload: ITokenPayload): Promise<string>;

  signRefreshToken(TokenPayload: ITokenPayload): Promise<string>;

  verifyAccessToken(accessToken: string): Promise<ITokenPayload>;

  verifyRefreshToken(refreshToken: string): Promise<ITokenPayload>;
}
