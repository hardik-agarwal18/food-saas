import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';
import type { IGetAvailableDeliveriesUseCase } from '../../application/use-cases/get-available-deliveries.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class GetAvailableDeliveriesController {
  constructor(
    @inject(DeliveryTokens.GetAvailableDeliveriesUseCase)
    private readonly getAvailableDeliveriesUseCase: IGetAvailableDeliveriesUseCase,
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const assignments = await this.getAvailableDeliveriesUseCase.execute(userId);
      sendResponse(res, 200, { success: true, message: 'Success', data: assignments });
    } catch (error) {
      next(error);
    }
  }
}
