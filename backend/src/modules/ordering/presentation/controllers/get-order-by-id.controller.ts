import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { OrderingTokens } from '../../infrastructure/tokens/ordering.tokens.js';
import type { IGetOrderByIdUseCase } from '../../application/use-cases/get-order-by-id.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class GetOrderByIdController {
  constructor(
    @inject(OrderingTokens.GetOrderByIdUseCase)
    private readonly getOrderByIdUseCase: IGetOrderByIdUseCase,
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = req.params.id as string;
      const actorId = req.user!.id as string;
      const actorRoles = req.user!.roles as string[];

      const result = await this.getOrderByIdUseCase.execute(orderId, actorId, actorRoles);

      sendResponse(res, 200, {
        success: true,
        message: 'Order retrieved successfully',
        data: result,
      });
    } catch (error) {
      if ((error as any).message === 'Order not found') {
        res
          .status(404)
          .json({ success: false, error: { message: 'Order not found', code: 'ORDER_NOT_FOUND' } });
        return;
      }
      if ((error as any).message === 'Unauthorized access to order') {
        res
          .status(403)
          .json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } });
        return;
      }
      next(error);
    }
  }
}
