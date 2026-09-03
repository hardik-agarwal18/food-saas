import { pino } from 'pino';
import { env } from '../../../config/env.config.js';

/**
 * Root application logger.
 *
 * Pino is responsible for writing structured logs.
 *
 * In development:
 * - Uses pino-pretty.
 * - Produces human-readable logs.
 *
 * In other environments:
 * - Uses Pino's default structured JSON output.
 * - This is more suitable for log aggregation systems.
 *
 * `base: undefined` removes Pino's default base fields,
 * such as the process ID and hostname, so that the application
 * can control the exact structure of every log entry.
 */
export const logger = pino({
  transport:
    env?.NODE_ENV === 'development'
      ? {
          /**
           * Formats logs for easier local development.
           */
          target: 'pino-pretty',
        }
      : undefined,

  /**
   * Prevents Pino from automatically adding fields such as
   * pid and hostname to every log entry.
   */
  base: undefined,
});
