/**
 * Health routes.
 *
 * This file defines the HTTP paths associated with health checks.
 *
 * Responsibilities:
 * - Create an Express router
 * - Resolve the HealthController through dependency injection
 * - Connect HTTP methods and paths to controller methods
 *
 * Routes:
 * - GET /live
 * - GET /health
 *
 * The route file should remain thin.
 * Business logic belongs in the controller and service layers.
 */

import express from 'express';
import { container } from 'tsyringe';
import { HealthController } from './health.controller.js';

/**
 * Create a dedicated Express router for health endpoints.
 *
 * A router groups related routes together and allows the main
 * application to mount them using app.use().
 */
const healthRouter = express.Router();

/**
 * Resolve the controller through the dependency injection container.
 *
 * The container creates the controller and provides its required
 * dependencies, such as HealthService and ILogger.
 */
const healthController = container.resolve(HealthController);

/**
 * Liveness route.
 *
 * GET /live
 *
 * Used to determine whether the application process is alive.
 */
healthRouter.route('/live').get(healthController.live);

/**
 * Health route.
 *
 * GET /health
 *
 * Used to check the health of application dependencies.
 */
healthRouter.route('/health').get(healthController.health);

export default healthRouter;
