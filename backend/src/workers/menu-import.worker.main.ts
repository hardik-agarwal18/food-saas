import 'reflect-metadata';
import { registerWorkerDependencies } from '../infrastructure/container/worker-registration.js';
import { container } from 'tsyringe';
import { InfrastructureTokens } from '../infrastructure/container/tokens/infrastructure.tokens.js';
import type { ILogger } from '../shared/logger/logger.interface.js';

registerWorkerDependencies();

// We also need to register the menu module for the worker, because it depends on usecases and repositories.
// worker-registration.ts registers infrastructure, but maybe not all modules. Let's do it explicitly.
import { registerMenuModule } from '../infrastructure/container/modules/menu.js';
registerMenuModule();

const baseLogger = container.resolve<ILogger>(InfrastructureTokens.Logger);
const logger = baseLogger.child({ component: 'MenuImportWorkerMain' });

const { menuImportWorker } = await import('../infrastructure/queue/workers/menu-import.worker.js');

logger.info('Menu Import worker started successfully');

let isShuttingDown = false;

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  if (isShuttingDown) {
    logger.warn(`Received ${signal} but shutdown is already in progress. Ignoring.`);
    return;
  }
  isShuttingDown = true;

  logger.info(`Received ${signal}. Shutting down menu import worker gracefully...`);

  const timeoutId = setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 30000);

  try {
    await menuImportWorker.close();
    clearTimeout(timeoutId);
    logger.info('Menu import worker shutdown complete');
    process.exit(0);
  } catch (error) {
    clearTimeout(timeoutId);
    logger.error('Error during menu import worker shutdown', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
