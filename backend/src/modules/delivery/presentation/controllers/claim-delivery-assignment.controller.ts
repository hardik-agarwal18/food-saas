import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IClaimDeliveryAssignmentUseCase } from '../../application/use-cases/claim-delivery-assignment.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';

@injectable()
export class ClaimDeliveryAssignmentController {
  constructor(
    @inject(DeliveryTokens.ClaimDeliveryAssignmentUseCase)
    private readonly claimDeliveryAssignmentUseCase: IClaimDeliveryAssignmentUseCase,
  ) {}

  async handle(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const assignmentId = req.params.assignmentId as string;

    await this.claimDeliveryAssignmentUseCase.execute(assignmentId, userId);
    sendResponse(res, 200, {
      success: true,
      message: 'Delivery assignment claimed successfully.',
      data: null,
    });
  }
}
