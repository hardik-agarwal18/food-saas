import express from 'express';
import { container } from 'tsyringe';
import { AuthenticationMiddleware } from '../../../../app/middleware/authentication.middleware.js';
import { validate } from '../../../../shared/validation/validate.js';
import {
  registerDriverSchema,
  toggleDriverAvailabilitySchema,
  updateDeliveryStatusSchema,
  updateDriverLocationSchema,
} from '../validators/delivery.validator.js';

import { RegisterDriverController } from '../controllers/register-driver.controller.js';
import { ToggleDriverAvailabilityController } from '../controllers/toggle-driver-availability.controller.js';
import { ClaimDeliveryAssignmentController } from '../controllers/claim-delivery-assignment.controller.js';
import { UpdateDeliveryStatusController } from '../controllers/update-delivery-status.controller.js';
import { GetAvailableDeliveriesController } from '../controllers/get-available-deliveries.controller.js';
import { GetDriverAssignmentsController } from '../controllers/get-driver-assignments.controller.js';
import { UpdateDriverLocationController } from '../controllers/update-driver-location.controller.js';

const router = express.Router();

const authenticationMiddleware = container.resolve(AuthenticationMiddleware);

const registerDriverController = container.resolve(RegisterDriverController);
const toggleDriverAvailabilityController = container.resolve(ToggleDriverAvailabilityController);
const claimDeliveryAssignmentController = container.resolve(ClaimDeliveryAssignmentController);
const updateDeliveryStatusController = container.resolve(UpdateDeliveryStatusController);
const getAvailableDeliveriesController = container.resolve(GetAvailableDeliveriesController);
const getDriverAssignmentsController = container.resolve(GetDriverAssignmentsController);
const updateDriverLocationController = container.resolve(UpdateDriverLocationController);

router.use(authenticationMiddleware.authenticate.bind(authenticationMiddleware));

// Driver profile routes
router.post(
  '/drivers/register',
  validate({ body: registerDriverSchema }),
  registerDriverController.handle.bind(registerDriverController),
);

router.patch(
  '/drivers/me/availability',
  validate({ body: toggleDriverAvailabilitySchema }),
  toggleDriverAvailabilityController.handle.bind(toggleDriverAvailabilityController),
);

router.patch(
  '/drivers/me/location',
  validate({ body: updateDriverLocationSchema }),
  updateDriverLocationController.handle.bind(updateDriverLocationController),
);

// Delivery assignment routes
router.get(
  '/deliveries/available',
  getAvailableDeliveriesController.handle.bind(getAvailableDeliveriesController),
);

router.get(
  '/deliveries/my-active',
  getDriverAssignmentsController.handle.bind(getDriverAssignmentsController),
);
router.post(
  '/deliveries/:assignmentId/claim',
  claimDeliveryAssignmentController.handle.bind(claimDeliveryAssignmentController),
);

router.patch(
  '/deliveries/:assignmentId/status',
  validate({ body: updateDeliveryStatusSchema }),
  updateDeliveryStatusController.handle.bind(updateDeliveryStatusController),
);

export default router;
