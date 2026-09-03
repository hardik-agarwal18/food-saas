import { injectable } from 'tsyringe';
import type { ILogger } from '../../../shared/logger/logger.interface.js';
import { LoggerFactory } from './logger.factory.js';
import { NextFunction, Request, Response } from 'express';

/**
 * Express middleware responsible for HTTP access logging.
 *
 * It records information about a request after the response
 * has finished.
 *
 * Logged information includes:
 * - HTTP method.
 * - Request path.
 * - Response status code.
 * - Client IP.
 * - User agent.
 * - Response content length.
 * - Total request duration.
 */
@injectable()
export class HttpLogger {
  /**
   * Logger configured specifically for HTTP logging.
   */
  private readonly logger: ILogger;

  constructor(loggerFactory: LoggerFactory) {
    /**
     * Create a child logger so that every HTTP log entry
     * identifies itself as coming from HttpLogger.
     */
    this.logger = loggerFactory.create({
      component: 'HttpLogger',
      module: 'Infrastructure',
    });
  }

  /**
   * Express middleware function.
   *
   * The timer starts before the request is passed to the
   * remaining middleware and route handlers.
   */
  middleware = (req: Request, res: Response, next: NextFunction): void => {
    const start = process.hrtime.bigint();

    /**
     * The `finish` event runs after Express has completed
     * sending the response.
     *
     * This allows the middleware to record the final status
     * code and total request duration.
     */
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;

      this.logger.info('HTTP request completed', {
        event: 'HTTP_REQUEST',
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        contentLength: res.getHeader('content-length'),
        durationInMs: Number(durationMs.toFixed(2)),
      });
    });

    /**
     * Continue processing the request.
     *
     * Without calling next(), the request would stop here
     * and never reach the next middleware or route handler.
     */
    next();
  };
}
