import { logger } from '../config/logger.js';
import { connectToRedis } from '../infrastructure/cache/redis.service.js';
import { connectToDatabase } from '../infrastructure/database/database.service.js';
import { registerQueryLogger } from '../infrastructure/database/query-logger.js';

export const bootstrap = async (): Promise<void> => {
  logger.info('Bootstrapping application...');

  registerQueryLogger();

  await connectToDatabase();
  await connectToRedis();

  logger.info('Application bootstrapped successfully');
};
