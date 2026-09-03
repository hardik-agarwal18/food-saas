/**
 * Infrastructure dependency registrations.
 *
 * This file connects infrastructure abstractions and tokens to
 * their concrete implementations.
 *
 * Responsibilities:
 * - Register configuration
 * - Register the Pino logger
 * - Register the application logger
 * - Register database dependencies
 * - Register Redis dependencies
 * - Register health services
 * - Register request-context services
 * - Register HTTP middleware
 *
 * This file should contain dependency wiring, not business logic.
 *
 * Dependency-injection example:
 *
 * Token:
 * InfrastructureTokens.Logger
 *
 * Implementation:
 * LoggerService
 *
 * Consumer:
 * HealthController
 *
 * The controller asks for ILogger, and tsyringe provides the
 * registered LoggerService implementation.
 */

import { container } from 'tsyringe';

import { InfrastructureTokens } from '../tokens/infrastructure.tokens.js';

import { env } from '../../../config/env.config.js';

import { prisma } from '../../database/prisma.js';
import { redis } from '../../cache/redis.js';

import { DatabaseService } from '../../database/database.service.js';
import { RedisService } from '../../cache/redis.service.js';
import { CacheService } from '../../cache/cache.service.js';

import { HealthService } from '../../observability/health.service.js';
import { ApiService } from '../../../app/health.service.js';

import { logger as pinoLogger } from '../../observability/logger/pino.js';
import { LoggerService } from '../../observability/logger/logger.service.js';
import { LoggerFactory } from '../../observability/logger/logger.factory.js';
import { HttpLogger } from '../../observability/logger/http.logger.js';

import { RequestContextService } from '../../observability/request-context/request-context.service.js';
import { RequestContextMiddleware } from '../../observability/request-context/request-context.middleware.js';

import { ErrorHandlerMiddleware } from '../../../app/middleware/error-handler.middleware.js';

/**
 * Registers all infrastructure dependencies.
 *
 * This function modifies the global tsyringe container.
 *
 * It does not create the entire application.
 * It only tells the container how to create or provide
 * infrastructure dependencies when they are requested.
 */
export const registerInfrastructure = (): void => {
  /**
   * Register the application configuration object.
   *
   * `registerInstance` tells tsyringe to always provide this
   * already-created object instead of creating a new one.
   */
  container.registerInstance(InfrastructureTokens.Configuration, env);

  /**
   * Register the shared low-level Pino logger instance.
   *
   * LoggerService depends on this Pino logger.
   */
  container.registerInstance(InfrastructureTokens.PinoLogger, pinoLogger);

  /**
   * Register the application logger implementation.
   *
   * Consumers request ILogger through InfrastructureTokens.Logger.
   * The container provides LoggerService.
   *
   * NOTE:
   * This registration is transient by default unless the project
   * explicitly configures another lifecycle.
   */
  container.register(InfrastructureTokens.Logger, LoggerService);

  /**
   * Register LoggerFactory as a singleton.
   *
   * One LoggerFactory instance is shared by the application.
   */
  container.registerSingleton(LoggerFactory);

  /**
   * Register HttpLogger as a singleton.
   *
   * The same HTTP logger middleware instance is reused.
   */
  container.registerSingleton(HttpLogger);

  /**
   * Register the shared Prisma client instance.
   *
   * The Prisma client has already been created in prisma.ts.
   * The container stores and returns that same instance.
   */
  container.registerInstance(InfrastructureTokens.PrismaClient, prisma);

  /**
   * Register the shared Redis client instance.
   *
   * The Redis client has already been created in redis.ts.
   */
  container.registerInstance(InfrastructureTokens.RedisClient, redis);

  /**
   * Register DatabaseService.
   *
   * When a class requests InfrastructureTokens.DatabaseService,
   * tsyringe creates a DatabaseService instance.
   */
  container.register(InfrastructureTokens.DatabaseService, {
    useClass: DatabaseService,
  });

  /**
   * Register RedisService.
   */
  container.register(InfrastructureTokens.RedisService, {
    useClass: RedisService,
  });

  /**
   * Register CacheService.
   */
  container.register(InfrastructureTokens.CacheService, {
    useClass: CacheService,
  });

  /**
   * Register HealthService.
   *
   * This is the service expected by HealthController.
   */
  container.register(InfrastructureTokens.HealthService, {
    useClass: HealthService,
  });

  /**
   * Register ApiService.
   *
   * This is a separate registration from HealthService.
   *
   * NOTE:
   * The project currently has both ApiService and HealthService.
   * Their responsibilities and naming should be clarified so
   * that future developers do not confuse them.
   */
  container.register(InfrastructureTokens.ApiService, {
    useClass: ApiService,
  });

  /**
   * Register RequestContextService as a singleton.
   *
   * The service uses the shared request-context store.
   * A singleton ensures that all parts of the application use
   * the same service instance.
   */
  container.registerSingleton(InfrastructureTokens.RequestContextService, RequestContextService);

  /**
   * Register RequestContextMiddleware as a singleton.
   *
   * The middleware is resolved by class rather than by a token.
   */
  container.registerSingleton(RequestContextMiddleware, RequestContextMiddleware);

  /**
   * Register ErrorHandlerMiddleware as a singleton.
   *
   * The middleware is also resolved directly by its class.
   */
  container.registerSingleton(ErrorHandlerMiddleware);
};
