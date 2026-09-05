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
import { Sha256TokenHasher } from '../../../modules/identity/infrastructure/security/sha256-token-hasher.js';
import { IdentityTransaction } from '../../../modules/identity/infrastructure/persistence/prisma/identity.transcation.js';
import { RegisterUserUseCaseImplementation } from '../../../modules/identity/application/use-cases/register-user.use-case.implementation.js';
import { LoginUserUseCaseImplementation } from '../../../modules/identity/application/use-cases/login-user.use-case.implementation.js';
import { GetCurrentUserUseCaseImplementation } from '../../../modules/identity/application/use-cases/get-current-user.use-case.implementation.js';
import { AuthorizationService } from '../../../modules/identity/domain/authorization/authorization.service.js';
import { RefreshTokenUseCaseImpl } from '../../../modules/identity/application/use-cases/refresh-token.use-case.impl.js';
import { LogoutUserUseCaseImpl } from '../../../modules/identity/application/use-cases/logout.user.use-case.impl.js';
import { ChangePasswordUseCaseImpl } from '../../../modules/identity/application/use-cases/change-password.use-case.impl.js';
import { VerifyEmailUseCaseImpl } from '../../../modules/identity/application/use-cases/verify-email.use-case.impl.js';
import { VerifyEmailRepository } from '../../../modules/identity/infrastructure/persistence/prisma/verify-email.repository.js';
import { PasswordResetRepository } from '../../../modules/identity/infrastructure/persistence/prisma/password-reset.repository.js';
import { ForgotPasswordUseCaseImpl } from '../../../modules/identity/application/use-cases/forgot-password.use-case.impl.js';
import { ResetPasswordUseCaseImpl } from '../../../modules/identity/application/use-cases/reset-password.use-case.impl.js';
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
   * Register the verify-email repository implementation.
   *
   * Whenever a class requests IdentityTokens.VerifyEmailRepository,
   * tsyringe provides VerifyEmailRepository.
   */
  container.register(IdentityTokens.VerifyEmailRepository, {
    useClass: VerifyEmailRepository,
  });

  /**
   * Register the password-reset repository implementation.
   *
   * Whenever a class requests IdentityTokens.PasswordResetRepository,
   * tsyringe provides PasswordResetRepository.
   */
  container.register(IdentityTokens.PasswordResetRepository, {
    useClass: PasswordResetRepository,
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

  /**
   * Register the token hasher implementation.
   *
   * Whenever a class requests IdentityTokens.TokenHasher,
   * tsyringe provides Sha256TokenHasher.
   */
  container.register(IdentityTokens.TokenHasher, {
    useClass: Sha256TokenHasher,
  });

  /**
   * Register the identity transaction implementation.
   *
   * Whenever a class requests IdentityTokens.Transaction,
   * tsyringe provides IdentityTransaction.
   */
  container.register(IdentityTokens.Transaction, {
    useClass: IdentityTransaction,
  });

  /**
   * Register the authorization service implementation.
   *
   * Whenever a class requests IdentityTokens.AuthorizationService,
   * tsyringe provides AuthorizationService.
   */
  container.registerSingleton(IdentityTokens.AuthorizationService, AuthorizationService);

  /**
   * Register the register user use case implementation.
   *
   * Whenever a class requests IdentityTokens.RegisterUserUseCase,
   * tsyringe provides RegisterUserUseCaseImplementation.
   */
  container.registerSingleton(
    IdentityTokens.RegisterUserUseCase,
    RegisterUserUseCaseImplementation,
  );

  /**
   * Register the login user use case implementation.
   *
   * Whenever a class requests IdentityTokens.LoginUserUseCase,
   * tsyringe provides LoginUserUseCaseImplementation.
   */
  container.registerSingleton(IdentityTokens.LoginUserUseCase, LoginUserUseCaseImplementation);

  /**
   * Register the get current user use case implementation.
   *
   * Whenever a class requests IdentityTokens.GetCurrentUserUseCase,
   * tsyringe provides GetCurrentUserUseCaseImplementation.
   */
  container.registerSingleton(
    IdentityTokens.GetCurrentUserUseCase,
    GetCurrentUserUseCaseImplementation,
  );

  /**
   * Register the refresh token use case implementation.
   *
   * Whenever a class requests IdentityTokens.RefreshTokenUseCase,
   * tsyringe provides RefreshTokenUseCaseImpl.
   */
  container.registerSingleton(IdentityTokens.RefreshTokenUseCase, RefreshTokenUseCaseImpl);

  /**
   * Register the logout user use case implementation.
   *
   * Whenever a class requests IdentityTokens.LogoutUserUseCase,
   * tsyringe provides LogoutUserUseCaseImpl.
   */
  container.registerSingleton(IdentityTokens.LogoutUserUseCase, LogoutUserUseCaseImpl);

  /**
   * Register the change password use case implementation.
   *
   * Whenever a class requests IdentityTokens.ChangePasswordUseCase,
   * tsyringe provides ChangePasswordUseCaseImpl.
   */
  container.registerSingleton(IdentityTokens.ChangePasswordUseCase, ChangePasswordUseCaseImpl);

  /**
   * Register the verify email use case implementation.
   *
   * Whenever a class requests IdentityTokens.VerifyEmailUseCase,
   * tsyringe provides VerifyEmailUseCaseImpl.
   */
  container.registerSingleton(IdentityTokens.VerifyEmailUseCase, VerifyEmailUseCaseImpl);

  /**
   * Register the forgot password use case implementation.
   */
  container.registerSingleton(IdentityTokens.ForgotPasswordUseCase, ForgotPasswordUseCaseImpl);

  /**
   * Register the reset password use case implementation.
   */
  container.registerSingleton(IdentityTokens.ResetPasswordUseCase, ResetPasswordUseCaseImpl);
};
