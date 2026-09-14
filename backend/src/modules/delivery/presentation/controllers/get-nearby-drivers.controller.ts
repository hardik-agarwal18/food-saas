import { Request, Response, NextFunction } from 'express';
import { injectable } from 'tsyringe';
import { DriverLocationService } from '../../application/services/driver-location.service.js';
import { getNearbyDriversSchema } from '../validators/delivery.validator.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class GetNearbyDriversController {
  constructor(private readonly driverLocationService: DriverLocationService) {}

  public execute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = getNearbyDriversSchema.parse(req.query);

      const drivers = await this.driverLocationService.getNearbyDrivers(
        validatedData.lat,
        validatedData.lng,
        validatedData.radius,
      );

      sendResponse(res, 200, {
        success: true,
        message: 'Success',
        data: {
          drivers,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
