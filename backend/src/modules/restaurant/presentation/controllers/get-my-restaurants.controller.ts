import { injectable, inject } from 'tsyringe';
import { catchAsync } from '../../../../shared/utils/CatchAsync.js';
import { NextFunction, Request, Response } from 'express';
import { RestaurantTokens } from '../../infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IGetMyRestaurantsUseCase } from '../../application/use-cases/get-my-restaurants.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class GetMyRestaurantsController {
  constructor(
    @inject(RestaurantTokens.GetMyRestaurantsUseCase)
    private readonly useCase: IGetMyRestaurantsUseCase,
  ) {}

  handle = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id as string;
    const result = await this.useCase.execute(userId);
    sendResponse(res, 200, {
      success: true,
      message: 'Restaurants fetched successfully',
      data: result,
    });
  });
}
