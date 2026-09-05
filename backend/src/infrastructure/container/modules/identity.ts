/**
 * Identity module dependency registrations.
 *
 * This file connects Identity repository interfaces/tokens to
 * their Prisma-based implementations.
 *
 * Responsibilities:
 * - Register UserRepository
 * - Register RefreshSessionRepository
 *
 * The Identity domain and application layers should depend on
 * repository contracts, not directly on Prisma repository classes.
 *
 * Example:
 *
 * Application layer:
 * IUserRepository
 *
 * DI token:
 * IdentityTokens.UserRepository
 *
 * Infrastructure implementation:
 * UserRepository
 *
 * This is an example of dependency inversion.
 */

import { container } from 'tsyringe';

import { IdentityTokens } from '../../../modules/identity/infrastructure/persistence/tokens/index.js';

import { UserRepository } from '../../../modules/identity/infrastructure/persistence/prisma/user.repository.js';
import { RefreshSessionRepository } from '../../../modules/identity/infrastructure/persistence/prisma/refresh-session.repository.js';
import { BcryptPasswordHasher } from '../../../modules/identity/infrastructure/security/bcrypt-password-hasher.js';
import { JwtService } from '../../../modules/identity/infrastructure/security/jwt/jwt.service.js';

/**
 * Registers dependencies belonging to the Identity module.
 *
 * The actual repository implementations are located in the
 * infrastructure/persistence/prisma directory.
 */
export const registerIdentity = (): void => {
  /**
   * Register the user repository implementation.
   *
   * Whenever a class requests IdentityTokens.UserRepository,
   * tsyringe provides UserRepository.
   */
  container.register(IdentityTokens.UserRepository, {
    useClass: UserRepository,
  });

  /**
   * Register the refresh-session repository implementation.
   *
   * Whenever a class requests IdentityTokens.RefreshSessionRepository,
   * tsyringe provides RefreshSessionRepository.
   */
  container.register(IdentityTokens.RefreshSessionRepository, {
    useClass: RefreshSessionRepository,
  });

  /**
   * Register the password hasher implementation.
   *
   * Whenever a class requests IdentityTokens.PasswordHasher,
   * tsyringe provides PasswordHasher.
   */
  container.registerSingleton(IdentityTokens.PasswordHasher, BcryptPasswordHasher);

  /**
   * Register jwt service implementation.
   *
   * Whenever a class requests IdentityTokens.JwtService,
   * tsyringe provides JwtService.
   */
  container.registerSingleton(IdentityTokens.JwtService, JwtService);
};
