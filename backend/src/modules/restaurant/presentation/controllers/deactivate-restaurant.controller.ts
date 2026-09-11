import { injectable, inject } from 'tsyringe';
import { catchAsync } from '../../../../shared/utils/CatchAsync.js';
import { NextFunction, Request, Response } from 'express';
import { RestaurantTokens } from '../../infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IDeactivateRestaurantUseCase } from '../../application/use-cases/deactivate-restaurant.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class DeactivateRestaurantController {
  constructor(
    @inject(RestaurantTokens.DeactivateRestaurantUseCase)
    private readonly useCase: IDeactivateRestaurantUseCase,
  ) {}

  handle = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const id = req.params.id as string;
    const userId = req.user?.id as string;
    const result = await this.useCase.execute(id, userId);
    sendResponse(res, 200, {
      success: true,
      message: 'Restaurant deactivated successfully',
      data: result,
    });
  });
}
