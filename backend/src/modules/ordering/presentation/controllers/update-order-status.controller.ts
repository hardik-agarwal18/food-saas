import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { OrderingTokens } from '../../infrastructure/tokens/ordering.tokens.js';
import type { IUpdateOrderStatusUseCase } from '../../application/use-cases/update-order-status.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class UpdateOrderStatusController {
  constructor(
    @inject((OrderingTokens as any).UpdateOrderStatusUseCase)
    private readonly updateOrderStatusUseCase: IUpdateOrderStatusUseCase,
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = req.params.orderId as string;
      const restaurantId = req.params.restaurantId as string;
      const userId = req.user!.id;
      const { status } = req.body;

      const result = await this.updateOrderStatusUseCase.execute(
        orderId,
        restaurantId,
        userId,
        status,
      );

      sendResponse(res, 200, {
        success: true,
        message: 'Order status updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
