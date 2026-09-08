import { container } from 'tsyringe';
import express from 'express';
import { AuthenticationMiddleware } from '../../../../app/middleware/authentication.middleware.js';
import { AuthorizationMiddleware } from '../../../../app/middleware/authorization.middleware.js';
import { Permission } from '../../../identity/domain/enums/permission.enum.js';
import { validate } from '../../../../shared/validation/validate.js';
import { createRestaurantSchema } from '../validators/create-restaurant.validator.js';
import { updateRestaurantSchema } from '../validators/update-restaurant.validator.js';
import { CreateRestaurantController } from '../controllers/create-restaurant.controller.js';
import { GetRestaurantByIdController } from '../controllers/get-restaurant-by-id.controller.js';
import { GetMyRestaurantsController } from '../controllers/get-my-restaurants.controller.js';
import { GetRestaurantsController } from '../controllers/get-restaurants.controller.js';
import { UpdateRestaurantController } from '../controllers/update-restaurant.controller.js';
import { DeleteRestaurantController } from '../controllers/delete-restaurant.controller.js';
import { ActivateRestaurantController } from '../controllers/activate-restaurant.controller.js';
import { DeactivateRestaurantController } from '../controllers/deactivate-restaurant.controller.js';
import { SuspendRestaurantController } from '../controllers/suspend-restaurant.controller.js';
import { ApproveRestaurantController } from '../controllers/approve-restaurant.controller.js';

const router = express.Router();

const auth = container.resolve(AuthenticationMiddleware);
const authz = container.resolve(AuthorizationMiddleware);

const createRestaurantController = container.resolve(CreateRestaurantController);
const getRestaurantByIdController = container.resolve(GetRestaurantByIdController);
const getMyRestaurantsController = container.resolve(GetMyRestaurantsController);
const getRestaurantsController = container.resolve(GetRestaurantsController);
const updateRestaurantController = container.resolve(UpdateRestaurantController);
const deleteRestaurantController = container.resolve(DeleteRestaurantController);
const activateRestaurantController = container.resolve(ActivateRestaurantController);
const deactivateRestaurantController = container.resolve(DeactivateRestaurantController);
const suspendRestaurantController = container.resolve(SuspendRestaurantController);
const approveRestaurantController = container.resolve(ApproveRestaurantController);

// ─── Public ────────────────────────────────────────────────────────────────
// GET /api/v1/restaurants  — list active restaurants
router.route('/').get(getRestaurantsController.handle.bind(getRestaurantsController));

// ─── Authenticated Owner ────────────────────────────────────────────────────
// POST /api/v1/restaurants  — create a restaurant
router
  .route('/')
  .post(
    auth.authenticate,
    authz.authorize(Permission.RESTAURANT_CREATE),
    validate({ body: createRestaurantSchema }),
    createRestaurantController.handle.bind(createRestaurantController),
  );

// GET /api/v1/restaurants/my  — owner's own restaurants
router
  .route('/my')
  .get(
    auth.authenticate,
    authz.authorize(Permission.RESTAURANT_READ),
    getMyRestaurantsController.handle.bind(getMyRestaurantsController),
  );

// GET /api/v1/restaurants/:id
router.route('/:id').get(getRestaurantByIdController.handle.bind(getRestaurantByIdController));

// PATCH /api/v1/restaurants/:id
router
  .route('/:id')
  .patch(
    auth.authenticate,
    authz.authorize(Permission.RESTAURANT_UPDATE),
    validate({ body: updateRestaurantSchema }),
    updateRestaurantController.handle.bind(updateRestaurantController),
  );

// DELETE /api/v1/restaurants/:id
router
  .route('/:id')
  .delete(
    auth.authenticate,
    authz.authorize(Permission.RESTAURANT_DELETE),
    deleteRestaurantController.handle.bind(deleteRestaurantController),
  );

// PATCH /api/v1/restaurants/:id/activate
router
  .route('/:id/activate')
  .patch(
    auth.authenticate,
    authz.authorize(Permission.RESTAURANT_UPDATE),
    activateRestaurantController.handle.bind(activateRestaurantController),
  );

// PATCH /api/v1/restaurants/:id/deactivate
router
  .route('/:id/deactivate')
  .patch(
    auth.authenticate,
    authz.authorize(Permission.RESTAURANT_UPDATE),
    deactivateRestaurantController.handle.bind(deactivateRestaurantController),
  );

// ─── Admin ──────────────────────────────────────────────────────────────────
// PATCH /api/v1/restaurants/:id/suspend  (admin)
router
  .route('/:id/suspend')
  .patch(
    auth.authenticate,
    authz.authorize(Permission.ADMIN_ACCESS),
    suspendRestaurantController.handle.bind(suspendRestaurantController),
  );

// PATCH /api/v1/restaurants/:id/approve  (admin)
router
  .route('/:id/approve')
  .patch(
    auth.authenticate,
    authz.authorize(Permission.ADMIN_ACCESS),
    approveRestaurantController.handle.bind(approveRestaurantController),
  );

export default router;
