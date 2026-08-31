import { ILogger } from '../../shared/logger/logger.interface.js';
import { InfrastructureTokens } from '../container/index.js';
import { prisma } from './prisma.js';
import { container } from 'tsyringe';

export const registerQueryLogger = (): void => {
  const logger = container.resolve<ILogger>(InfrastructureTokens.Logger);

  prisma.$on('query', (event) => {
    logger.debug('Database Query Executed', {
      component: 'database',
      query: event.query,
      duration: event.duration,
      params: event.params,
    });
  });
};
