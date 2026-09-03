import { ILogger } from '../../shared/logger/logger.interface.js';
import { InfrastructureTokens } from '../container/index.js';
import { prisma } from './prisma.js';
import { container } from 'tsyringe';

let isRegistered = false;

export const registerQueryLogger = (): void => {
  if (isRegistered) {
    return;
  }

  const logger = container.resolve<ILogger>(InfrastructureTokens.Logger);

  prisma.$on('query', (event) => {
    logger.debug('Database Query Executed', {
      component: 'Database',
      query: event.query,
      duration: event.duration,
      params: event.params,
    });
  });
};
