import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';
import type { IUpdateDriverLocationUseCase } from '../../application/use-cases/update-driver-location.use-case.js';

@injectable()
export class UpdateDriverLocationController {
  constructor(
    @inject(DeliveryTokens.UpdateDriverLocationUseCase)
    private readonly updateDriverLocationUseCase: IUpdateDriverLocationUseCase,
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { latitude, longitude } = req.body;

      await this.updateDriverLocationUseCase.execute(userId, latitude, longitude);

      res.status(200).json({ success: true, message: 'Location updated successfully' });
    } catch (error) {
      next(error);
    }
  }
}
