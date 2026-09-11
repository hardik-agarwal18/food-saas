import { injectable, inject } from 'tsyringe';
import { catchAsync } from '../../../../shared/utils/CatchAsync.js';
import { NextFunction, Request, Response } from 'express';
import { RestaurantTokens } from '../../infrastructure/persistence/tokens/restaurant.tokens.js';
import type { ISuspendRestaurantUseCase } from '../../application/use-cases/suspend-restaurant.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class SuspendRestaurantController {
  constructor(
    @inject(RestaurantTokens.SuspendRestaurantUseCase)
    private readonly useCase: ISuspendRestaurantUseCase,
  ) {}

  handle = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const id = req.params.id as string;
    const result = await this.useCase.execute(id);
    sendResponse(res, 200, {
      success: true,
      message: 'Restaurant suspended successfully',
      data: result,
    });
  });
}
