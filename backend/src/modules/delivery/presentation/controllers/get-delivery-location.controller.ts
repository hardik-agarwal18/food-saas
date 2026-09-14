import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';
import type { IGetDeliveryLocationUseCase } from '../../application/use-cases/get-delivery-location.use-case.js';

@injectable()
export class GetDeliveryLocationController {
  constructor(
    @inject(DeliveryTokens.GetDeliveryLocationUseCase)
    private readonly useCase: IGetDeliveryLocationUseCase,
  ) {}

  public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const assignmentId = req.params.assignmentId as string;
      const actorId = req.user!.id;
      const actorRoles = req.user!.roles || [];

      const location = await this.useCase.execute({
        actorId,
        actorRoles,
        assignmentId,
      });

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
        data: location,
      });
    } catch (error: any) {
      if (
        error.message === 'Delivery assignment not found' ||
        error.message === 'No driver assigned to this delivery yet'
      ) {
        res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
        return;
      }
      if (error.message === 'Unauthorized access to delivery location') {
        res
          .status(403)
          .json({ success: false, error: { code: 'FORBIDDEN', message: error.message } });
        return;
      }
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
      const actorId = req.user!.id;
      const actorRoles = req.user!.roles || [];

      const location = await this.useCase.execute({
        actorId,
        actorRoles,
        orderId,
      });

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
        data: location,
      });
    } catch (error: any) {
      if (
        error.message === 'Delivery assignment not found' ||
        error.message === 'No driver assigned to this delivery yet'
      ) {
        res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
        return;
      }
      if (error.message === 'Unauthorized access to delivery location') {
        res
          .status(403)
          .json({ success: false, error: { code: 'FORBIDDEN', message: error.message } });
        return;
      }
      next(error);
    }
  };
}
