import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { OrderingTokens } from '../../infrastructure/tokens/ordering.tokens.js';
import type { IGetRestaurantAnalyticsUseCase } from '../../application/use-cases/get-restaurant-analytics.use-case.js';
import { AppError } from '../../../../shared/errors/AppError.js';
import { OrderingDomainError } from '../../domain/errors/ordering-domain.error.js';

@injectable()
export class GetRestaurantAnalyticsController {
  constructor(
    @inject(OrderingTokens.GetRestaurantAnalyticsUseCase)
    private readonly getAnalyticsUseCase: IGetRestaurantAnalyticsUseCase,
  ) {}

  public execute = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED', true);
      }

      const restaurantId = req.params.restaurantId as string;

      const analytics = await this.getAnalyticsUseCase.execute(userId, restaurantId);

      res.status(200).json(analytics);
    } catch (error: any) {
      if (error instanceof OrderingDomainError) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}
