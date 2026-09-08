import type { Express } from 'express';
import identityRouter from '../modules/identity/presentation/routes/identity.route.js';
import customersRouter from '../modules/customer/presentation/routes/customer.route.js';
import restaurantRouter from '../modules/restaurant/presentation/routes/restaurant.routes.js';
import { orderingRoutes } from '../modules/ordering/presentation/routes/ordering.routes.js';

/**
 * Registers all application routes.
 *
 * @param app - The Express application instance.
 */
export const registerRoutes = (app: Express): void => {
  app.use('/api/v1/identity', identityRouter);
  app.use('/api/v1/customer', customersRouter);
  app.use('/api/v1/restaurants', restaurantRouter);
  app.use('/api/v1/orders', orderingRoutes);
};
