/**
 * Infrastructure dependency tokens.
 *
 * This object contains the identifiers used by tsyringe to locate
 * infrastructure dependencies.
 *
 * Why tokens are needed:
 *
 * TypeScript interfaces disappear at runtime.
 *
 * For example:
 *
 * interface ILogger {
 *   info(message: string): void;
 * }
 *
 * The interface exists only during TypeScript compilation.
 * JavaScript cannot use ILogger as a runtime dependency identifier.
 *
 * A token provides a runtime identifier that can be used by
 * tsyringe to connect an interface to its implementation.
 *
 * Example:
 *
 * container.register(InfrastructureTokens.Logger, {
 *   useClass: LoggerService,
 * });
 *
 * Then a class can request the logger using:
 *
 * @inject(InfrastructureTokens.Logger)
 * logger: ILogger
 *
 * `as const` makes the token properties readonly and preserves
 * their exact symbol types.
 */

export const InfrastructureTokens = {
  /**
   * Application environment/configuration object.
   */
  Configuration: Symbol.for('Infrastructure.Configuration'),

  /**
   * Low-level Pino logger instance.
   */
  PinoLogger: Symbol.for('Infrastructure.PinoLogger'),

  /**
   * Application-level logger abstraction.
   */
  Logger: Symbol.for('Infrastructure.Logger'),

  /**
   * Shared Prisma client instance.
   */
  PrismaClient: Symbol.for('Infrastructure.PrismaClient'),

  /**
   * Database service responsible for database operations
   * and connection management.
   */
  DatabaseService: Symbol.for('Infrastructure.DatabaseService'),

  /**
   * Shared Redis client instance.
   */
  RedisClient: Symbol.for('Infrastructure.RedisClient'),

  /**
   * Redis service responsible for Redis connection and operations.
   */
  RedisService: Symbol.for('Infrastructure.RedisService'),

  /**
   * Cache service that provides application-level cache operations.
   */
  CacheService: Symbol.for('Infrastructure.CacheService'),

  /**
   * API service token.
   *
   * This token is currently associated with ApiService in the
   * infrastructure registration file.
   */
  ApiService: Symbol.for('Infrastructure.ApiService'),

  /**
   * Health service token.
   *
   * This token is currently associated with HealthService.
   */
  HealthService: Symbol.for('Infrastructure.HealthService'),

  /**
   * Request-context service token.
   *
   * This service provides access to the context of the current
   * asynchronous HTTP request.
   */
  RequestContextService: Symbol.for('Infrastructure.RequestContextService'),

  /**
   * Email service token.
   *
   * This token is currently associated with EmailService in the
   * infrastructure registration file.
   */
  EmailService: Symbol.for('Infrastructure.EmailService'),
} as const;
