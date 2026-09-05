/**
 * Dependency-injection tokens used by the Identity module.
 *
 * Symbols are used instead of class names so that the application
 * depends on abstractions/interfaces rather than concrete implementations.
 */
export const IdentityTokens = {
  /**
   * Token used to resolve the user repository implementation.
   */
  UserRepository: Symbol.for('Identity.UserRepository'),

  /**
   * Token used to resolve the refresh-session repository implementation.
   */
  RefreshSessionRepository: Symbol.for('Identity.RefreshSessionRepository'),

  /**
   * Token used to resolve the password hasher implementation.
   */
  PasswordHasher: Symbol.for('Identity.PasswordHasher'),

  /**
   * Token used to resolve the JWT service implementation.
   */
  JwtService: Symbol.for('Identity.JwtService'),

  /**
   * Token used to resolve the token hasher implementation.
   */
  TokenHasher: Symbol.for('Identity.TokenHasher'),

  /**
   * Token used to resolve the transaction implementation.
   */
  Transaction: Symbol.for('Identity.Transaction'),

  /**
   * Token used to resolve the authorization service implementation.
   */
  AuthorizationService: Symbol.for('Identity.AuthorizationService'),

  /**
   * Token used to resolve the register user use case implementation.
   */
  RegisterUserUseCase: Symbol.for('Identity.RegisterUserUseCase'),

  /**
   * Token used to resolve the login user use case implementation.
   */
  LoginUserUseCase: Symbol.for('Identity.LoginUserUseCase'),

  /**
   * Token used to resolve the get current user use case implementation.
   */
  GetCurrentUserUseCase: Symbol.for('Identity.GetCurrentUserUseCase'),

  /**
   * Token used to resolve the refresh token use case implementation.
   */
  RefreshTokenUseCase: Symbol.for('Identity.RefreshTokenUseCase'),

  /**
   * Token used to resolve the logout user use case implementation.
   */
  LogoutUserUseCase: Symbol.for('Identity.LogoutUserUseCase'),

  /**
   * Token used to resolve the change password use case implementation.
   */
  ChangePasswordUseCase: Symbol.for('Identity.ChangePasswordUseCase'),

  /**
   * Token used to resolve the verify email use case implementation.
   */
  VerifyEmailUseCase: Symbol.for('Identity.VerifyEmailUseCase'),

  /**
   * Token used to resolve the verify email repository implementation.
   */
  VerifyEmailRepository: Symbol.for('Identity.VerifyEmailRepository'),
} as const;
