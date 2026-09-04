import { injectable, inject } from 'tsyringe';
import { InfrastructureTokens } from '../../container/tokens/infrastructure.tokens.js';
import type { ILogger } from '../../../shared/logger/logger.interface.js';
import type { LogContext } from '../../../shared/logger/log-context.js';

/**
 * Creates feature-specific child loggers.
 *
 * Instead of resolving the root logger and manually adding
 * component/module metadata in every log statement, callers
 * can create a logger with permanent bindings.
 *
 * Example:
 *
 * const logger = loggerFactory.create({
 *   component: 'Database',
 *   module: 'Infrastructure',
 * });
 */
@injectable()
export class LoggerFactory {
  constructor(
    /**
     * Resolve the application logger through its DI token.
     *
     * The concrete implementation is LoggerService,
     * but consumers depend on ILogger.
     */
    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,
  ) {}

  /**
   * Creates a child logger with fixed structured bindings.
   *
   * The returned logger still receives request context
   * because LoggerService.child() preserves the existing
   * RequestContextService.
   */
  create(context: LogContext) {
    return this.logger.child(context);
  }
}
