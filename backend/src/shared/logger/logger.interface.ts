/**
 * Abstraction for the application's logging system.
 *
 * The rest of the application should depend on ILogger rather than
 * directly depending on a specific logging library such as Pino.
 *
 * This follows the Dependency Inversion Principle:
 *
 * - Application code depends on this interface.
 * - Infrastructure code provides the actual implementation.
 *
 * Because the application uses this interface, the underlying
 * logging library can be replaced without changing every service.
 */
export interface ILogger {
  /**
   * Logs very detailed diagnostic information.
   *
   * Trace logs are normally used when investigating the exact
   * execution flow of a request or operation.
   */
  trace(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs debugging information useful during development
   * or troubleshooting.
   */
  debug(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs normal application events.
   *
   * Examples:
   * - A user was created.
   * - A request completed successfully.
   * - A background job finished.
   */
  info(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs abnormal situations that do not necessarily stop
   * the current operation.
   *
   * Examples:
   * - A fallback cache path was used.
   * - A retry is about to happen.
   * - A non-critical dependency responded slowly.
   */
  warn(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs an error that prevented an operation from completing.
   *
   * The error parameter can contain the original exception,
   * while context can contain additional structured metadata.
   */
  error(message: string, error?: unknown, context?: Record<string, unknown>): void;

  /**
   * Logs a critical failure that may require immediate attention.
   *
   * Fatal logs are generally used when the application or one
   * of its essential components cannot continue safely.
   */
  fatal(message: string, error?: unknown, context?: Record<string, unknown>): void;

  /**
   * Creates a child logger with permanent contextual bindings.
   *
   * Example:
   *
   * const logger = baseLogger.child({
   *   component: 'RestaurantService',
   * });
   *
   * logger.info('Restaurant created');
   *
   * Every log written by the child logger can automatically
   * include the component information.
   */
  child(bindings: Record<string, unknown>): ILogger;
}
