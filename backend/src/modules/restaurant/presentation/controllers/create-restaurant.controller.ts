import { injectable, inject } from 'tsyringe';
import { catchAsync } from '../../../../shared/utils/CatchAsync.js';
import { NextFunction, Request, Response } from 'express';
import { RestaurantTokens } from '../../infrastructure/persistence/tokens/restaurant.tokens.js';
import type { ICreateRestaurantUseCase } from '../../application/use-cases/create-restaurant.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class CreateRestaurantController {
  constructor(
    @inject(RestaurantTokens.CreateRestaurantUseCase)
    private readonly createRestaurantUseCase: ICreateRestaurantUseCase,
  ) {}

  handle = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;

    // Validation is handled by middleware
    const result = await this.createRestaurantUseCase.execute(userId, req.body);

    sendResponse(res, 201, {
      success: true,
      message: 'Restaurant created successfully',
      data: result,
    });
  });
}
