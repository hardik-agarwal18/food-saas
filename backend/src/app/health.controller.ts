/**
 * Health controller.
 *
 * The controller is responsible for handling HTTP requests related
 * to application health.
 *
 * Responsibilities:
 * - Receive the HTTP request
 * - Call the health service
 * - Convert the service result into an HTTP response
 * - Log health information
 *
 * The controller should not contain database logic or infrastructure
 * implementation details. Those responsibilities belong to services
 * and infrastructure classes.
 *
 * Endpoints handled by this controller:
 * - GET /live
 * - GET /health
 */

import { injectable, inject } from 'tsyringe';
import { InfrastructureTokens } from '../infrastructure/container/index.js';
import { HealthService } from '../infrastructure/observability/health.service.js';
import { catchAsync } from '../shared/utils/CatchAsync.js';
import { NextFunction, Request, Response } from 'express';
import type { ILogger } from '../shared/logger/logger.interface.js';
import { LoggerFactory } from '../infrastructure/observability/logger/logger.factory.js';

/**
 * Handles health-related HTTP requests.
 *
 * The class is marked as injectable so that tsyringe can create
 * the controller and provide its dependencies.
 */
@injectable()
export class HealthController {
  constructor(
    /**
     * Service responsible for checking the health of application
     * dependencies.
     */
    @inject(InfrastructureTokens.HealthService)
    private readonly healthService: HealthService,

    /**
     * Logger interface used by the controller.
     *
     * The controller depends on ILogger instead of a concrete
     * logging implementation.
     */
    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,

    /**
     * LoggerFactory creates a child logger with controller-specific
     * metadata.
     */
    loggerFactory: LoggerFactory,
  ) {
    /**
     * Create a logger containing metadata that identifies the source
     * of the log messages.
     *
     * NOTE:
     * The component is currently named "HealthService", although
     * this class is the controller. "HealthController" may be
     * a more accurate component name.
     */

    this.logger = loggerFactory.create({
      component: 'HealthService',
      module: 'app',
    });
  }

  /**
   * Liveness endpoint.
   *
   * Purpose:
   * Indicates whether the application process is alive and able
   * to respond to HTTP requests.
   *
   * This endpoint does not check external dependencies.
   * Therefore, the application may return "alive" even if the
   * database or Redis is unavailable.
   *
   * Response:
   * {
   *   success: true,
   *   status: "alive",
   *   timestamp: "..."
   * }
   */
  live = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({
      success: true,
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Readiness/health endpoint.
   *
   * Purpose:
   * Checks the health of the services used by the application.
   *
   * Unlike the liveness endpoint, this endpoint calls HealthService
   * and returns the health status of configured dependencies.
   */
  health = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    /**
     * Ask the health service to check the application's dependencies.
     */
    const services = await this.healthService.getHealthStatus();

    this.logger.info('Health service', { services });

    return res.status(200).json({
      success: true,
      status: 'healthy',
      services,
      timestamp: new Date().toISOString(),
    });
  });
}
