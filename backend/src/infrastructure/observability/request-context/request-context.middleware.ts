import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { InfrastructureTokens } from '../../container/tokens/infrastructure.tokens.js';
import { RequestContextService } from '../../observability/request-context/request-context.service.js';
import { randomUUID } from 'node:crypto';

/**
 * RequestContextMiddleware
 *
 * Creates a request-scoped context for every incoming HTTP request.
 *
 * The context contains:
 * - requestId: Unique ID for this specific request
 * - correlationId: ID used to connect logs across services or requests
 *
 * The context is stored using AsyncLocalStorage, which allows
 * services deeper in the application to access request information
 * without passing requestId and correlationId through every function.
 *
 * This middleware must run before:
 * - HTTP logging middleware
 * - Routes
 * - Controllers
 * - Services that need request context
 */
@injectable()
export class RequestContextMiddleware {
  constructor(
    @inject(InfrastructureTokens.RequestContextService)
    private readonly requestContextService: RequestContextService,
  ) {}

  handle = (req: Request, res: Response, next: NextFunction): void => {
    const requestId = randomUUID();

    const correlationIdHeader = req.header('x-correlation-id');

    const correlationId =
      typeof correlationIdHeader === 'string' && correlationIdHeader.trim().length > 0
        ? correlationIdHeader
        : requestId;

    this.requestContextService.run({ requestId, correlationId }, () => {
      next();
    });
  };
}
