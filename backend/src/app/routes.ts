import type { Express } from 'express';
import express from 'express';
import identityRoutes from '../modules/identity/presentation/routes/identity.route.js';
import restaurantRoutes from '../modules/restaurant/presentation/routes/restaurant.routes.js';
import menuRoutes from '../modules/menu/presentation/routes/menu.routes.js';
import { orderingRoutes } from '../modules/ordering/presentation/routes/ordering.routes.js';
import deliveryRoutes from '../modules/delivery/presentation/routes/delivery.routes.js';
import customerRoutes from '../modules/customer/presentation/routes/customer.route.js';

/**
 * Registers all application routes.
 *
 * @param app - The Express application instance.
 */
export const registerRoutes = (app: Express): void => {
  const apiRouter = express.Router();

  apiRouter.use('/identity', identityRoutes);
  apiRouter.use('/customers', customerRoutes);
  apiRouter.use('/restaurants', restaurantRoutes);
  apiRouter.use('/restaurants', menuRoutes);
  apiRouter.use('/orders', orderingRoutes);
  apiRouter.use('/', deliveryRoutes);

  app.use('/api/v1', apiRouter);
};
