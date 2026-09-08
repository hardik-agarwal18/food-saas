import { injectable, inject } from 'tsyringe';
import { catchAsync } from '../../../../shared/utils/CatchAsync.js';
import { NextFunction, Request, Response } from 'express';
import { RestaurantTokens } from '../../infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IGetRestaurantsUseCase } from '../../application/use-cases/get-restaurants.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class GetRestaurantsController {
  constructor(
    @inject(RestaurantTokens.GetRestaurantsUseCase)
    private readonly useCase: IGetRestaurantsUseCase,
  ) {}

  handle = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const result = await this.useCase.execute({
      status: req.query.status as string | undefined,
      city: req.query.city as string | undefined,
      limit,
      offset,
    });

    sendResponse(res, 200, {
      success: true,
      message: 'Restaurants fetched successfully',
      data: result,
    });
  });
}
