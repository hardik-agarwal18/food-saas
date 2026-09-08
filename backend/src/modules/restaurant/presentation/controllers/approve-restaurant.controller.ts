import { injectable, inject } from 'tsyringe';
import { catchAsync } from '../../../../shared/utils/CatchAsync.js';
import { NextFunction, Request, Response } from 'express';
import { RestaurantTokens } from '../../infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IApproveRestaurantUseCase } from '../../application/use-cases/approve-restaurant.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class ApproveRestaurantController {
  constructor(
    @inject(RestaurantTokens.ApproveRestaurantUseCase)
    private readonly useCase: IApproveRestaurantUseCase,
  ) {}

  handle = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const id = req.params.id as string;
    const result = await this.useCase.execute(id);
    sendResponse(res, 200, {
      success: true,
      message: 'Restaurant approved successfully',
      data: result,
    });
  });
}
