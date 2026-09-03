import timeout from 'connect-timeout';
import { NextFunction, Request, Response, type RequestHandler } from 'express';
import { env } from '../../config/env.config.js';

/**
 * Adds a timeout to incoming requests.
 *
 * The timeout duration is read from environment configuration.
 *
 * When the duration is exceeded, connect-timeout marks
 * the request as timed out.
 */
export const timeoutMiddleware: RequestHandler = timeout(env.REQUEST_TIMEOUT) as RequestHandler;

/**
 * Stops the middleware chain when a request has timed out.
 *
 * This should be registered after timeoutMiddleware and
 * before routes that should not continue processing after
 * a timeout.
 */
export const haltOnTimeout: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  if (!req.timedout) {
    next();
  }
};
