import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IToggleDriverAvailabilityUseCase } from '../../application/use-cases/toggle-driver-availability.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';

@injectable()
export class ToggleDriverAvailabilityController {
  constructor(
    @inject(DeliveryTokens.ToggleDriverAvailabilityUseCase)
    private readonly toggleDriverAvailabilityUseCase: IToggleDriverAvailabilityUseCase,
  ) {}

  async handle(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { isAvailable } = req.body;

    await this.toggleDriverAvailabilityUseCase.execute(userId, isAvailable);
    sendResponse(res, 200, {
      success: true,
      message: `Driver is now ${isAvailable ? 'online' : 'offline'}.`,
      data: null,
    });
  }
}
