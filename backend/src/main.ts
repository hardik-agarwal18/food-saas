import 'reflect-metadata';

import './infrastructure/container/container.js';

import { bootstrap } from './app/bootstrap.js';
import { createServer } from './app/server.js';
import { shutdown } from './app/shutdown.js';
import { LoggerService } from './infrastructure/observability/logger/logger.service.js';
import { container } from 'tsyringe';

const logger = container.resolve(LoggerService);

const start = async (): Promise<void> => {
  try {
    await bootstrap();

    const server = createServer();

    process.on('SIGINT', () => shutdown(server, 'SIGINT'));
    process.on('SIGTERM', () => shutdown(server, 'SIGTERM'));
  } catch (error) {
    logger.error('Process error:', error);

    process.exit(1);
  }
};

await start();

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.message);
  logger.error('Error stack:', err.stack);
  process.exit(1); // Exit the process with a failure code
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);

  process.exit(1); // Exit the process with a failure code
});
