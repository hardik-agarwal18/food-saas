import 'reflect-metadata';
import { container } from 'tsyringe';
import { config } from 'dotenv';
import { DatabaseService } from '../infrastructure/database/database.service.js';
import { RedisService } from '../infrastructure/cache/redis.service.js';
import { ILogger } from '../shared/logger/logger.interface.js';
import { InfrastructureTokens } from '../infrastructure/container/tokens/infrastructure.tokens.js';
import { PrismaClient } from '../generated/prisma/client.js';

// We need to import registration to ensure all handlers are bound to the container
import { registerWorkerDependencies } from '../infrastructure/container/worker-registration.js';
// Load environment variables
config();

registerWorkerDependencies();

const baseLogger = container.resolve<ILogger>(InfrastructureTokens.Logger);
const logger = baseLogger.child({ component: 'OutboxWorkerMain' });

logger.info('Bootstrapping Outbox Worker process...');

const databaseService = container.resolve(DatabaseService);
const redisService = container.resolve(RedisService);

// Connect infrastructure
await databaseService.connectToDatabase();
await redisService.connectToRedis();

const prisma = container.resolve<PrismaClient>(InfrastructureTokens.PrismaClient);

// Import startOutboxWorker
const { startOutboxWorker } = await import('../infrastructure/queue/workers/outbox.worker.js');

// Start the polling logic
// We capture the interval ID so we can shut it down gracefully
const { stopOutboxWorker } = startOutboxWorker(prisma, logger);
logger.info('Outbox Worker started successfully');

let isShuttingDown = false;

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  if (isShuttingDown) {
    logger.warn(`Received ${signal} but shutdown is already in progress. Ignoring.`);
    return;
  }
  isShuttingDown = true;

  logger.info(`Received ${signal}. Shutting down outbox worker gracefully...`);

  const timeoutId = setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 30000);

  try {
    stopOutboxWorker();

    // Disconnect infrastructure
    await prisma.$disconnect();

    clearTimeout(timeoutId);
    logger.info('Outbox worker shutdown complete');
    process.exit(0);
  } catch (error) {
    clearTimeout(timeoutId);
    logger.error('Error during outbox worker shutdown', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
