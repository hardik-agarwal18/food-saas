import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { OrderingTokens } from '../../infrastructure/tokens/ordering.tokens.js';
import type { IPlaceOrderUseCase } from '../../application/use-cases/place-order.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class PlaceOrderController {
  constructor(
    @inject((OrderingTokens as any).PlaceOrderUseCase)
    private readonly placeOrderUseCase: IPlaceOrderUseCase,
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { restaurantId, orderType, deliveryAddress, specialInstructions, items } = req.body;

      const result = await this.placeOrderUseCase.execute(userId, { restaurantId, orderType, deliveryAddress, specialInstructions, items });

      sendResponse(res, 201, {
        success: true,
        message: 'Order placed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
