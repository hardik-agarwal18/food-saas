import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthenticationMiddleware } from '../../../../app/middleware/authentication.middleware.js';
import { AuthorizationMiddleware } from '../../../../app/middleware/authorization.middleware.js';
import { validate } from '../../../../shared/validation/validate.js';
import { Permission } from '../../../identity/domain/enums/permission.enum.js';
import { PlaceOrderController } from '../controllers/place-order.controller.js';
import { GetCustomerOrdersController } from '../controllers/get-customer-orders.controller.js';
import { GetRestaurantOrdersController } from '../controllers/get-restaurant-orders.controller.js';
import { UpdateOrderStatusController } from '../controllers/update-order-status.controller.js';
import { GetOrderByIdController } from '../controllers/get-order-by-id.controller.js';
import { GetRestaurantAnalyticsController } from '../controllers/get-restaurant-analytics.controller.js';
import {
  placeOrderSchema,
  updateOrderStatusSchema,
  paginationQuerySchema,
} from '../validators/ordering.validator.js';

const router = Router();

// Retrieve instances from DI
const auth = container.resolve(AuthenticationMiddleware);
const authz = container.resolve(AuthorizationMiddleware);
const placeOrderController = container.resolve(PlaceOrderController);
const getCustomerOrdersController = container.resolve(GetCustomerOrdersController);
const getRestaurantOrdersController = container.resolve(GetRestaurantOrdersController);
const updateOrderStatusController = container.resolve(UpdateOrderStatusController);
const getOrderByIdController = container.resolve(GetOrderByIdController);
const getRestaurantAnalyticsController = container.resolve(GetRestaurantAnalyticsController);

// Customer Routes
router.post(
  '/',
  auth.authenticate,
  authz.authorize(Permission.ORDER_CREATE),
  validate({ body: placeOrderSchema }),
  placeOrderController.handle.bind(placeOrderController),
);

router.get(
  '/',
  auth.authenticate,
  authz.authorize(Permission.ORDER_READ),
  validate({ query: paginationQuerySchema }),
  getCustomerOrdersController.handle.bind(getCustomerOrdersController),
);

router.get(
  '/:id',
  auth.authenticate,
  authz.authorize(Permission.ORDER_READ),
  getOrderByIdController.handle.bind(getOrderByIdController),
);

// Restaurant Routes
router.get(
  '/restaurants/:restaurantId',
  auth.authenticate,
  authz.authorize(Permission.ORDER_READ),
  validate({ query: paginationQuerySchema }),
  getRestaurantOrdersController.handle.bind(getRestaurantOrdersController),
);

router.get(
  '/restaurants/:restaurantId/analytics',
  auth.authenticate,
  authz.authorize(Permission.ORDER_READ),
  getRestaurantAnalyticsController.execute.bind(getRestaurantAnalyticsController),
);

router.patch(
  '/restaurants/:restaurantId/:orderId/status',
  auth.authenticate,
  authz.authorize(Permission.ORDER_UPDATE),
  validate({ body: updateOrderStatusSchema }),
  updateOrderStatusController.handle.bind(updateOrderStatusController),
);

export { router as orderingRoutes };
