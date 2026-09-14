import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';
import type { IGetDriverProfileUseCase } from '../../application/use-cases/get-driver-profile.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class GetDriverProfileController {
  constructor(
    @inject(DeliveryTokens.GetDriverProfileUseCase)
    private readonly getDriverProfileUseCase: IGetDriverProfileUseCase,
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await this.getDriverProfileUseCase.execute(userId);
      sendResponse(res, 200, { success: true, message: 'Success', data: profile });
    } catch (error) {
      next(error);
    }
  }
}
