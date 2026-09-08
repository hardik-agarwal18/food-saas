import { JwtService } from '../../src/modules/identity/infrastructure/security/jwt/jwt.service.js';
import { User } from '../../src/modules/identity/domain/entities/index.js';

/**
 * Generates a valid test access token for the given user.
 */
export async function generateTestAccessToken(user: User): Promise<string> {
  const jwtService = new JwtService();
  return jwtService.signAccessToken({
    sub: user.getId(),
    roles: user.getRoles(),
    type: 'ACCESS_TOKEN' as any,
  });
}

/**
 * Generates a valid test refresh token for the given user.
 */
export async function generateTestRefreshToken(user: User): Promise<string> {
  const jwtService = new JwtService();
  return jwtService.signRefreshToken({
    sub: user.getId(),
    roles: user.getRoles(),
    type: 'REFRESH_TOKEN' as any,
  });
}
