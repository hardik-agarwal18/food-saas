import { injectable, inject } from 'tsyringe';
import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

import { InfrastructureTokens } from '../../infrastructure/container/tokens/infrastructure.tokens.js';
import type { ILogger } from '../../shared/logger/logger.interface.js';
import { ErrorSerializer } from '../../shared/errors/error-serializer.js';
import { mapError } from '../../shared/errors/error-mapper.js';
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
     * Map known domain errors to application errors.
     */
    const mappedError = mapError(
      error instanceof Error ? error : new Error(String(error)),
      this.env.NODE_ENV === 'production',
    );

    /**
     * Log operational errors as warnings and unexpected errors as errors.
     */
    if (mappedError.isOperational) {
      this.logger.warn(mappedError.message, {
        component: 'ErrorHandler',
        operation: 'handle',
        errorCode: mappedError.code,
        statusCode: mappedError.statusCode,
        isOperational: mappedError.isOperational,
        method: req.method,
        path: req.path,
      });
    } else {
      this.logger.error('Unhandled exception', error instanceof Error ? error : undefined, {
        component: 'ErrorHandler',
        operation: 'handle',
        method: req.method,
        path: req.path,
      });
    }

    /**
     * Return the standardized error response.
     */
    res.status(mappedError.statusCode).json(ErrorSerializer.serialize(mappedError));
  };
}
