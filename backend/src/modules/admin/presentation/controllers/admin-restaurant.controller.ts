import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { RestaurantTokens } from '../../../restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import { AdminTokens } from '../../infrastructure/tokens/admin.tokens.js';
import type { IApproveRestaurantUseCase } from '../../../restaurant/application/use-cases/approve-restaurant.use-case.js';
import type { ISuspendRestaurantUseCase } from '../../../restaurant/application/use-cases/suspend-restaurant.use-case.js';
import type { IGetPendingRestaurantsUseCase } from '../../application/use-cases/get-pending-restaurants.use-case.js';

@injectable()
export class AdminRestaurantController {
  constructor(
    @inject(RestaurantTokens.ApproveRestaurantUseCase)
    private readonly approveRestaurantUseCase: IApproveRestaurantUseCase,
    @inject(RestaurantTokens.SuspendRestaurantUseCase)
    private readonly suspendRestaurantUseCase: ISuspendRestaurantUseCase,
    @inject(AdminTokens.GetPendingRestaurantsUseCase)
    private readonly getPendingRestaurantsUseCase: IGetPendingRestaurantsUseCase,
  ) {}

  async getPending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const restaurants = await this.getPendingRestaurantsUseCase.execute();
      res.status(200).json({ success: true, data: restaurants });
    } catch (error) {
      next(error);
    }
  }

  async approve(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const restaurant = await this.approveRestaurantUseCase.execute(id);
      res.status(200).json({ success: true, data: restaurant });
    } catch (error) {
      next(error);
    }
  }

  async suspend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const restaurant = await this.suspendRestaurantUseCase.execute(id);
      res.status(200).json({ success: true, data: restaurant });
    } catch (error) {
      next(error);
    }
  }
}
