import { inject, injectable } from 'tsyringe';
import type { ILogger } from '../../../shared/logger/logger.interface.js';
import type { Logger } from 'pino';
import { logger as pinoLogger } from './pino.js';
import { InfrastructureTokens } from '../../container/index.js';

@injectable()
export class LoggerService implements ILogger {
  constructor(
    @inject(InfrastructureTokens.PinoLogger) private readonly logger: Logger = pinoLogger,
  ) {}

  trace(message: string, context: Record<string, unknown> = {}): void {
    this.logger.trace(context, message);
  }

  debug(message: string, context: Record<string, unknown> = {}): void {
    this.logger.debug(context, message);
  }

  info(message: string, context: Record<string, unknown> = {}): void {
    this.logger.info(context, message);
  }

  warn(message: string, context: Record<string, unknown> = {}): void {
    this.logger.warn(context, message);
  }

  error(message: string, error?: unknown, context: Record<string, unknown> = {}): void {
    this.logger.error({ ...context, error }, message);
  }

  fatal(message: string, error?: unknown, context: Record<string, unknown> = {}): void {
    this.logger.fatal({ ...context, error }, message);
  }

  child(bindings: Record<string, unknown>): ILogger {
    return new LoggerService(this.logger.child(bindings));
  }
}
