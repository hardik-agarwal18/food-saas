import { Server } from 'http';
import { logger } from '../config/logger.js';
import { disconnectFromDatabase } from '../infrastructure/database/database.service.js';

export const shutdown = (server: Server, signal: string): void => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      await disconnectFromDatabase();
    } catch (error) {
      logger.error({ error }, 'Error occurred while disconnecting from the database.');

      process.exit(1); // Exit the process with a failure code
    }

    process.exit(0);
  });
};
