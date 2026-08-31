import { container } from 'tsyringe';
import { Server } from 'http';
import { logger } from '../config/logger.js';
import { DatabaseService } from '../infrastructure/database/database.service.js';
import { RedisService } from '../infrastructure/cache/redis.service.js';

export const shutdown = (server: Server, signal: string): void => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      const databaseService = container.resolve(DatabaseService);
      const redisService = container.resolve(RedisService);

      await databaseService.disconnectFromDatabase();
      await redisService.disconnectFromRedis();

      process.exit(0);
    } catch (error) {
      process.exit(1); // Exit the process with a failure code
    }
  });
};
