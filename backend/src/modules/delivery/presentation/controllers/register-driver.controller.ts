import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IRegisterDriverUseCase } from '../../application/use-cases/register-driver.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';

@injectable()
export class RegisterDriverController {
  constructor(
    @inject(DeliveryTokens.RegisterDriverUseCase)
    private readonly registerDriverUseCase: IRegisterDriverUseCase,
  ) {}

  async handle(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id; // from auth middleware
    await this.registerDriverUseCase.execute({
      userId,
      ...req.body,
    });
    sendResponse(res, 201, {
      success: true,
      message: 'Driver registered successfully.',
      data: null,
    });
  }
}
