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
  UserRepository: Symbol('Identity.UserRepository'),

  /**
   * Token used to resolve the refresh-session repository implementation.
   */
  RefreshSessionRepository: Symbol('Identity.RefreshSessionRepository'),
} as const;
