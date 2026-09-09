import express from 'express';
import { container } from 'tsyringe';
import { AuthenticationMiddleware } from '../../../../app/middleware/authentication.middleware.js';
import { validate } from '../../../../shared/validation/validate.js';
import {
  registerDriverSchema,
  toggleDriverAvailabilitySchema,
  updateDeliveryStatusSchema,
} from '../validators/delivery.validator.js';

import { RegisterDriverController } from '../controllers/register-driver.controller.js';
import { ToggleDriverAvailabilityController } from '../controllers/toggle-driver-availability.controller.js';
import { ClaimDeliveryAssignmentController } from '../controllers/claim-delivery-assignment.controller.js';
import { UpdateDeliveryStatusController } from '../controllers/update-delivery-status.controller.js';

const router = express.Router();

const authenticationMiddleware = container.resolve(AuthenticationMiddleware);

const registerDriverController = container.resolve(RegisterDriverController);
const toggleDriverAvailabilityController = container.resolve(ToggleDriverAvailabilityController);
const claimDeliveryAssignmentController = container.resolve(ClaimDeliveryAssignmentController);
const updateDeliveryStatusController = container.resolve(UpdateDeliveryStatusController);

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

// Delivery assignment routes
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
