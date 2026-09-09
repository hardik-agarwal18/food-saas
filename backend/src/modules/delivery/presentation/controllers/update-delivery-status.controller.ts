import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IUpdateDeliveryStatusUseCase } from '../../application/use-cases/update-delivery-status.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';

@injectable()
export class UpdateDeliveryStatusController {
  constructor(
    @inject(DeliveryTokens.UpdateDeliveryStatusUseCase)
    private readonly updateDeliveryStatusUseCase: IUpdateDeliveryStatusUseCase,
  ) {}

  async handle(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const assignmentId = req.params.assignmentId as string;
    const { status } = req.body;

    await this.updateDeliveryStatusUseCase.execute(assignmentId, userId, status);
    sendResponse(res, 200, {
      success: true,
      message: 'Delivery status updated successfully.',
      data: null,
    });
  }
}
