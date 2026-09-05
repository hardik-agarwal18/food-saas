import type { Express } from 'express';
import identityRouter from '../modules/identity/presentation/routes/identity.route.js';

/**
 * Registers all application routes.
 *
 * @param app - The Express application instance.
 */
export const registerRoutes = (app: Express): void => {
  app.use('/api/v1/identity', identityRouter);
};
