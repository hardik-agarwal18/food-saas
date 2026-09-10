import express from 'express';
import { container } from 'tsyringe';
import { AuthenticationMiddleware } from '../../../../app/middleware/authentication.middleware.js';
import { AuthorizationMiddleware } from '../../../../app/middleware/authorization.middleware.js';
import { Permission } from '../../../identity/domain/enums/permission.enum.js';
import { AdminRestaurantController } from '../controllers/admin-restaurant.controller.js';
import { AdminUserController } from '../controllers/admin-user.controller.js';

const router = express.Router();

const auth = container.resolve(AuthenticationMiddleware);
const authz = container.resolve(AuthorizationMiddleware);
const adminRestaurantController = container.resolve(AdminRestaurantController);
const adminUserController = container.resolve(AdminUserController);

router.use(auth.authenticate.bind(auth));
router.use(authz.authorize(Permission.ADMIN_ACCESS));

// Restaurant management
router.get(
  '/restaurants/pending',
  adminRestaurantController.getPending.bind(adminRestaurantController),
);

router.patch(
  '/restaurants/:id/approve',
  adminRestaurantController.approve.bind(adminRestaurantController),
);

router.patch(
  '/restaurants/:id/suspend',
  adminRestaurantController.suspend.bind(adminRestaurantController),
);

// User management
router.patch('/users/:id/suspend', adminUserController.suspend.bind(adminUserController));

export default router;
