import { prisma } from './prisma.js';
import { logger } from '../../config/logger.js';

export const registerQueryLogger = (): void => {
  prisma.$on('query', (event) => {
    logger.debug(
      {
        component: 'database',
        query: event.query,
        duration: event.duration,
        params: event.params,
      },
      'Database Query Executed',
    );
  });
};
