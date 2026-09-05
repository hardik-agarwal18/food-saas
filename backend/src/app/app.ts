/**
 * Application composition file.
 *
 * This file creates and configures the Express application.
 *
 * Responsibilities:
 * - Create the Express application instance
 * - Register security middleware
 * - Register request-context middleware
 * - Register HTTP request logging
 * - Register application routes
 * - Register the global error handler
 *
 * Important:
 * Middleware order matters in Express. Middleware is executed
 * in the same order in which it is registered.
 *
 * Current request flow:
 *
 * Security
 *   → Request context
 *   → HTTP logger
 *   → Routes
 *   → Error handler
 */

import express from 'express';

import healthRouter from './health.routes.js';
import { registerRoutes } from './routes.js';
import { container } from 'tsyringe';
import { HttpLogger } from '../infrastructure/observability/logger/http.logger.js';
import { RequestContextMiddleware } from '../infrastructure/observability/request-context/request-context.middleware.js';
import { ErrorHandlerMiddleware } from './middleware/error-handler.middleware.js';
import { registerSecurity } from '../infrastructure/security/security.js';

/**
 * Creates the Express application.
 *
 * The application is exported instead of starting the HTTP server here.
 * This separation allows:
 * - Tests to import the app without opening a network port
 * - server.ts to control when the server starts
 * - main.ts to control the complete startup process
 */
export const app = express();

/**
 * Register security-related middleware.
 *
 * This should happen before routes so that incoming requests
 * receive the configured security protections.
 */
registerSecurity(app);

/**
 * Register request-context middleware.
 *
 * This must run before the HTTP logger and routes because the
 * request context contains information such as:
 * - requestId
 * - correlationId
 *
 * Logging and application services may need to access this context.
 */
const requestContextMiddleware = container.resolve(RequestContextMiddleware);
app.use(requestContextMiddleware.handle);

/**
 * Register HTTP request logging.
 *
 * The HTTP logger records information when a response finishes,
 * such as:
 * - HTTP method
 * - URL
 * - status code
 * - request duration
 * - client information
 */
const httpLogger = container.resolve(HttpLogger);
app.use(httpLogger.middleware);

/**
 * Register application routes.
 *
 * The health router exposes:
 * - GET /live
 * - GET /health  
 *
 * Additional routers can be registered here as the application grows.
 */
app.use(healthRouter);

/**
 * Register all application module routes.
 *
 * Each module (identity, ordering, restaurant, etc.) mounts
 * its own router under /api/v1/<module>.
 */
registerRoutes(app);

/**
 * Register the global error handler.
 *
 * Error-handling middleware should be registered after routes.
 * This allows it to handle errors passed from controllers,
 * services, and other middleware.
 */
const errorHandler = container.resolve(ErrorHandlerMiddleware);
app.use(errorHandler.handle);
