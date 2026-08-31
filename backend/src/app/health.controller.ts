import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../shared/utils/CatchAsync.js';
import { HealthService } from '../infrastructure/observability/health.service.js';
import { InfrastructureTokens } from '../infrastructure/container/index.js';
import type { ILogger } from '../shared/logger/logger.interface.js';
import { LoggerFactory } from '../infrastructure/observability/logger/logger.factory.js';

@injectable()
export class HealthController {
  constructor(
    @inject(InfrastructureTokens.HealthService) private readonly healthService: HealthService,
    @inject(InfrastructureTokens.Logger) private readonly logger: ILogger,

    loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.create({ component: 'HealthService', module: 'app' });
  }

  live = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({
      success: true,
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  });

  health = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const services = await this.healthService.getHealthStatus();

    this.logger.info('Health check performed', { services });

    return res.status(200).json({
      success: true,
      status: 'ready',
      services,
      timestamp: new Date().toISOString(),
    });
  });
}
