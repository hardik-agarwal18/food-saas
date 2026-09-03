/**
 * Initializes the metadata reflection system before dependency
 * injection and decorated classes are used.
 */
import 'reflect-metadata';

/**
 * Imports the dependency-injection registrations.
 *
 * This import executes the container registration code so that
 * all required services, repositories, and configuration objects
 * are available before the application starts.
 */
import './infrastructure/container/container.js';

import { container } from 'tsyringe';

import { bootstrap } from './app/bootstrap.js';
import { createServer } from './app/server.js';
import { shutdown } from './app/shutdown.js';

import { InfrastructureTokens } from './infrastructure/container/tokens/infrastructure.tokens.js';
import type { ILogger } from './shared/logger/logger.interface.js';

/**
 * Resolve the logger through the DI token instead of depending
 * directly on the concrete LoggerService implementation.
 */
const logger = container.resolve<ILogger>(InfrastructureTokens.Logger);

/**
 * Handles unexpected process-level failures.
 *
 * These handlers must be registered before startup begins so that
 * failures during bootstrap are also captured.
 */
process.on('uncaughtException', (error: unknown) => {
  if (error instanceof Error) {
    logger.error('Uncaught exception', error, {
      component: 'Process',
      operation: 'uncaughtException',
    });
  } else {
    logger.error('Uncaught exception', undefined, {
      component: 'Process',
      operation: 'uncaughtException',
      reason: error,
    });
  }

  /**
   * An uncaught exception leaves the process in an unknown state.
   * The process should terminate rather than continue unpredictably.
   */
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  if (reason instanceof Error) {
    logger.error('Unhandled promise rejection', reason, {
      component: 'Process',
      operation: 'unhandledRejection',
    });
  } else {
    logger.error('Unhandled promise rejection', undefined, {
      component: 'Process',
      operation: 'unhandledRejection',
      reason,
    });
  }

  /**
   * Unhandled promise rejections are treated as fatal process errors.
   */
  process.exit(1);
});

/**
 * Starts the application.
 *
 * Startup steps:
 * 1. Initialize application dependencies and infrastructure.
 * 2. Create the Express server.
 * 3. Register operating-system shutdown signals.
 */
const start = async (): Promise<void> => {
  try {
    /**
     * Initialize application infrastructure such as the database,
     * Redis, configuration, and other startup dependencies.
     */
    await bootstrap();

    /**
     * Create and configure the HTTP server.
     */
    const server = createServer();

    /**
     * Gracefully shut down the application when the process receives
     * a termination signal.
     */
    process.on('SIGINT', () => {
      void shutdown(server, 'SIGINT');
    });

    process.on('SIGTERM', () => {
      void shutdown(server, 'SIGTERM');
    });
  } catch (error: unknown) {
    /**
     * Startup failed before the server could run successfully.
     */
    if (error instanceof Error) {
      logger.error('Application startup failed', error, {
        component: 'Process',
        operation: 'start',
      });
    } else {
      logger.error('Application startup failed', undefined, {
        component: 'Process',
        operation: 'start',
        reason: error,
      });
    }

    /**
     * Exit with a failure code because the application could not
     * initialize correctly.
     */
    process.exit(1);
  }
};

/**
 * Start the application only after all process-level error handlers
 * have been registered.
 */
await start();
