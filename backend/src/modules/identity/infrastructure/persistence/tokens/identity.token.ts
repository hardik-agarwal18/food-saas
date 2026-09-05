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
} as const;
