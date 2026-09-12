import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';
import type { IDeliveryAssignmentRepository } from '../../domain/repositories/delivery-assignment.repository.js';
import { DriverLocationService } from '../../application/services/driver-location.service.js';

@injectable()
export class GetDeliveryLocationController {
  constructor(
    @inject(DeliveryTokens.DeliveryAssignmentRepository)
    private readonly assignmentRepo: IDeliveryAssignmentRepository,
    @inject(DeliveryTokens.DriverLocationService)
    private readonly locationService: DriverLocationService,
  ) {}

  public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const assignmentId = req.params.assignmentId as string;

      const assignment = await this.assignmentRepo.findById(assignmentId);

      if (!assignment) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Delivery assignment not found' },
        });
        return;
      }

      if (!assignment.driverId) {
        res.status(404).json({
          success: false,
          error: { code: 'NO_DRIVER', message: 'No driver assigned to this delivery yet' },
        });
        return;
      }

      const location = await this.locationService.getLocation(assignment.driverId);

      if (!location) {
        res.status(404).json({
          success: false,
          error: {
            code: 'LOCATION_UNAVAILABLE',
            message: 'Driver location is currently unavailable',
          },
        });
        return;
      }

      // location is [longitude, latitude] string tuple from Redis GEOPOS format (which our service returns)
      res.status(200).json({
        success: true,
        data: {
          longitude: parseFloat(location[0]),
          latitude: parseFloat(location[1]),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public handleByOrderId = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const orderId = req.params.orderId as string;

      const assignments = await this.assignmentRepo.findByOrderId(orderId);

      if (assignments.length === 0) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Delivery assignment not found for order' },
        });
        return;
      }

      // Find the active/latest assignment (usually there's only one, or one active)
      const assignment =
        assignments.find(
          (a) =>
            a.status === 'ACCEPTED' ||
            a.status === 'PICKED_UP' ||
            a.status === 'DRIVER_ARRIVING' ||
            a.status === 'DELIVERED',
        ) || assignments[0];

      if (!assignment.driverId) {
        res.status(404).json({
          success: false,
          error: { code: 'NO_DRIVER', message: 'No driver assigned to this delivery yet' },
        });
        return;
      }

      const location = await this.locationService.getLocation(assignment.driverId);

      if (!location) {
        res.status(404).json({
          success: false,
          error: {
            code: 'LOCATION_UNAVAILABLE',
            message: 'Driver location is currently unavailable',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          longitude: parseFloat(location[0]),
          latitude: parseFloat(location[1]),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
