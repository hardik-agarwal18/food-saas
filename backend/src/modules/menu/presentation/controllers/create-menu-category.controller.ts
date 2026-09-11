import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import type { ICreateMenuCategoryUseCase } from '../../application/use-cases/create-menu-category.use-case.js';
import { MenuTokens } from '../../infrastructure/persistence/tokens/menu.tokens.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class CreateMenuCategoryController {
  constructor(
    @inject((MenuTokens as any).CreateMenuCategoryUseCase)
    private readonly createCategoryUseCase: ICreateMenuCategoryUseCase,
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId as string;
      const userId = req.user!.id;

      const result = await this.createCategoryUseCase.execute(restaurantId, userId, req.body);

      sendResponse(res, 201, {
        success: true,
        message: 'Menu category created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
