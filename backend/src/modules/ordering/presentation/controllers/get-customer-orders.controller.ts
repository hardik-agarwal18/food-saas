import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { OrderingTokens } from '../../infrastructure/tokens/ordering.tokens.js';
import type { IGetCustomerOrdersUseCase } from '../../application/use-cases/get-customer-orders.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class GetCustomerOrdersController {
  constructor(
    @inject((OrderingTokens as any).GetCustomerOrdersUseCase)
    private readonly getCustomerOrdersUseCase: IGetCustomerOrdersUseCase,
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = req.user!.id; // Again, assuming user ID maps to customer ID for now
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await this.getCustomerOrdersUseCase.execute(customerId, { page, limit });

      sendResponse(res, 200, {
        success: true,
        message: 'Orders retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
