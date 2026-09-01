import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { InfrastructureTokens } from '../../container/index.js';
import { RequestContextService } from '../../observability/request-context/request-context.service.js';
import { randomUUID } from 'node:crypto';

@injectable()
export class RequestContextMiddleware {
  constructor(
    @inject(InfrastructureTokens.RequestContextService)
    private readonly requestContextService: RequestContextService,
  ) {}

  handle(req: Request, res: Response, next: NextFunction): void {
    const requestId = randomUUID();

    const correlationIdHeader = req.header('x-correlation-id');

    const correlationId =
      typeof correlationIdHeader === 'string' && correlationIdHeader.trim().length > 0
        ? correlationIdHeader
        : requestId;

    this.requestContextService.run({ requestId, correlationId }, () => {
      next();
    });
  }
}
