import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { OrderingTokens } from '../../infrastructure/tokens/ordering.tokens.js';
import type { IGetRestaurantOrdersUseCase } from '../../application/use-cases/get-restaurant-orders.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class GetRestaurantOrdersController {
  constructor(
    @inject((OrderingTokens as any).GetRestaurantOrdersUseCase)
    private readonly getRestaurantOrdersUseCase: IGetRestaurantOrdersUseCase,
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId as string;
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await this.getRestaurantOrdersUseCase.execute(restaurantId, userId, {
        page,
        limit,
      });

      sendResponse(res, 200, {
        success: true,
        message: 'Restaurant orders retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
