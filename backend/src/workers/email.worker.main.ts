import 'reflect-metadata';
import { registerWorkerDependencies } from '../infrastructure/container/worker-registration.js';
import { container } from 'tsyringe';
import { InfrastructureTokens } from '../infrastructure/container/tokens/infrastructure.tokens.js';
import type { ILogger } from '../shared/logger/logger.interface.js';

registerWorkerDependencies();

const baseLogger = container.resolve<ILogger>(InfrastructureTokens.Logger);
const logger = baseLogger.child({ component: 'EmailWorkerMain' });

const { emailWorker } = await import('../infrastructure/queue/workers/email.worker.js');

logger.info('Email worker started successfully');

let isShuttingDown = false;

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  if (isShuttingDown) {
    logger.warn(`Received ${signal} but shutdown is already in progress. Ignoring.`);
    return;
  }
  isShuttingDown = true;

  logger.info(`Received ${signal}. Shutting down email worker gracefully...`);

  // Force exit if graceful shutdown takes too long (e.g. hung jobs)
  const timeoutId = setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 30000);

  try {
    await emailWorker.close();
    clearTimeout(timeoutId);
    logger.info('Email worker shutdown complete');
    process.exit(0);
  } catch (error) {
    clearTimeout(timeoutId);
    logger.error('Error during email worker shutdown', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
