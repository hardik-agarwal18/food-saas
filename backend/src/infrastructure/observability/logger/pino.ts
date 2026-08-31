import { pino } from 'pino';
import { env } from '../../../config/env.config.js';

export const logger = pino({
  transport:
    env?.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
        }
      : undefined,
  base: undefined,
});
