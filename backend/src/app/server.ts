/**
 * HTTP server creation file.
 *
 * This file starts the Express application on the configured port.
 *
 * Responsibilities:
 * - Read the configured port
 * - Resolve the application logger
 * - Start the HTTP server
 * - Log when the server begins listening
 *
 * This file does not perform database or Redis initialization.
 * Infrastructure initialization is handled by bootstrap.ts.
 */

import { container } from 'tsyringe';
import { env } from '../config/env.config.js';
import { app } from './app.js';
import { InfrastructureTokens } from '../infrastructure/container/tokens/infrastructure.tokens.js';
import type { ILogger } from '../shared/logger/logger.interface.js';

const port = env.PORT;

/**
 * Creates and starts the HTTP server.
 *
 * This function is separated from app.ts so that importing the
 * Express application does not automatically open a network port.
 *
 * @returns The Node.js HTTP server instance.
 */
export const createServer = () => {
  const logger = container.resolve<ILogger>(InfrastructureTokens.Logger);

  /**
   * Start listening for incoming HTTP requests.
   *
   * The callback runs after the server successfully begins
   * listening on the configured port.
   */
  const server = app.listen(port, () => {
    logger.info(`Server running on PORT:${port}`);
  });

  /**
   * Return the server instance so main.ts can register shutdown
   * handlers and shutdown.ts can close the server gracefully.
   */
  return server;
};
