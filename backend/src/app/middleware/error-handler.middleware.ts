import { injectable, inject } from 'tsyringe';
import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

import { InfrastructureTokens } from '../../infrastructure/container/index.js';
import type { ILogger } from '../../shared/logger/logger.interface.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorSerializer } from '../../shared/errors/error-serializer.js';
import type { Env } from '../../config/env.schema.js';

/**
 * Central Express error-handling middleware.
 *
 * Responsibilities:
 * - Handle errors passed through Express's `next(error)`.
 * - Delegate to Express when the response has already started.
 * - Serialize known application errors into the standard API format.
 * - Log operational and unexpected errors.
 * - Hide internal error details in production.
 */
@injectable()
export class ErrorHandlerMiddleware {
  constructor(
    /**
     * Application environment configuration.
     *
     * This is used to decide whether the original error message
     * can safely be returned to the client.
     */
    @inject(InfrastructureTokens.Configuration)
    private readonly env: Env,

    /**
     * Shared application logger.
     */
    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,
  ) {}

  /**
   * Express error-handling middleware.
   *
   * Express identifies error middleware by its four parameters:
   * `(error, request, response, next)`.
   */
  handle: ErrorRequestHandler = (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    /**
     * If the response has already started, this middleware should not
     * attempt to write another response.
     *
     * Passing the error to Express allows Express to terminate the
     * connection using its default error-handling behavior.
     */
    if (res.headersSent) {
      next(error);
      return;
    }

    /**
     * Handle errors created by our application.
     *
     * AppError contains a known HTTP status code, error code,
     * and operational-error information.
     */
    if (error instanceof AppError) {
      this.logger.warn(error.message, {
        component: 'ErrorHandler',
        operation: 'handle',
        errorCode: error.code,
        statusCode: error.statusCode,
        isOperational: error.isOperational,

        /**
         * Include basic request context for debugging.
         *
         * Avoid logging the complete URL if query parameters may
         * contain sensitive information.
         */
        method: req.method,
        path: req.path,
      });

      /**
       * Convert the application error into the standard API response.
       */
      res.status(error.statusCode).json(ErrorSerializer.serialize(error));

      return;
    }

    /**
     * Unknown errors are unexpected and should be logged as errors.
     *
     * Passing the original error as the second argument allows the
     * logger to preserve useful information such as the stack trace,
     * depending on the logger implementation.
     */
    this.logger.error('Unhandled exception', error instanceof Error ? error : undefined, {
      component: 'ErrorHandler',
      operation: 'handle',
      method: req.method,
      path: req.path,
    });

    /**
     * Never expose internal error details in production.
     *
     * During development, returning the original message makes
     * debugging easier.
     */
    const message =
      this.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred.'
        : error instanceof Error
          ? error.message
          : 'Unknown error';

    /**
     * Return a generic 500 response for unexpected errors.
     */
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message,
      },
    });
  };
}
