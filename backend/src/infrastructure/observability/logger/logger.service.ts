import type { Logger } from 'pino';
import { ILogger } from '../../../shared/logger/logger.interface.js';
import { inject, injectable } from 'tsyringe';
import { LogContext } from '../../../shared/logger/log-context.js';
import { InfrastructureTokens } from '../../container/index.js';
import { RequestContextService } from '../request-context/request-context.service.js';

/**
 * Application-facing logger implementation.
 *
 * This class hides Pino behind the ILogger interface.
 *
 * Other parts of the application should depend on ILogger
 * instead of directly depending on Pino.
 *
 * Responsibilities:
 * - Delegate log calls to Pino.
 * - Add request-related context.
 * - Add user-specific context when supplied.
 * - Create child loggers with fixed bindings.
 */
@injectable()
export class LoggerService implements ILogger {
  constructor(
    /**
     * The underlying Pino logger.
     *
     * Pino performs the actual log writing.
     */
    @inject(InfrastructureTokens.PinoLogger)
    private readonly logger: Logger,

    /**
     * Provides request-scoped information such as:
     * - requestId
     * - correlationId
     */
    @inject(InfrastructureTokens.RequestContextService)
    private readonly requestContext: RequestContextService,
  ) {}

  /**
   * Combines request context with explicitly supplied log context.
   *
   * The returned object becomes the structured metadata
   * attached to the log entry.
   *
   * Explicit context is spread last, so values supplied by
   * the caller can override automatically enriched values.
   */
  private enrich(context: LogContext = {}) {
    const request = this.requestContext.get();

    return {
      /**
       * Automatically attach the current request ID.
       */
      requestId: request?.requestId,

      /**
       * Automatically attach the current correlation ID.
       */
      correlationId: request?.correlationId,

      /**
       * Attach the user ID when it is provided.
       */
      userId: context?.userId,

      /**
       * Preserve all additional context fields.
       *
       * Because this is spread last, a caller-provided value
       * can override requestId, correlationId, or userId.
       */
      ...context,
    };
  }

  /**
   * Logs highly detailed diagnostic information.
   */
  trace(message: string, context: LogContext = {}): void {
    this.logger.trace(this.enrich(context), message);
  }

  /**
   * Logs debugging information useful during development
   * or troubleshooting.
   */
  debug(message: string, context: LogContext = {}): void {
    this.logger.debug(this.enrich(context), message);
  }

  /**
   * Logs normal application events.
   */
  info(message: string, context: LogContext = {}): void {
    this.logger.info(this.enrich(context), message);
  }

  /**
   * Logs warning conditions that do not necessarily stop
   * the current operation.
   */
  warn(message: string, context: LogContext = {}): void {
    this.logger.warn(this.enrich(context), message);
  }

  /**
   * Logs an error condition.
   *
   * The error is included inside the structured log context.
   */
  error(message: string, error?: unknown, context: LogContext = {}): void {
    this.logger.error(
      this.enrich({
        ...context,
        error,
      }),
      message,
    );
  }

  /**
   * Logs a fatal condition.
   *
   * Fatal logs usually represent serious failures that may
   * require application shutdown or immediate investigation.
   */
  fatal(message: string, error?: unknown, context: LogContext = {}): void {
    this.logger.fatal(
      this.enrich({
        ...context,
        error,
      }),
      message,
    );
  }

  /**
   * Creates a new logger with permanent bindings.
   *
   * Example:
   *
   * logger.child({
   *   component: 'Database',
   *   module: 'Infrastructure',
   * });
   *
   * Every log written by the returned logger will contain
   * those bindings in addition to the current request context.
   */
  child(bindings: LogContext): ILogger {
    return new LoggerService(this.logger.child(bindings), this.requestContext);
  }
}
