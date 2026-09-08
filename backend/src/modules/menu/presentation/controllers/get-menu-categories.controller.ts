import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import type { IGetMenuCategoriesUseCase } from '../../application/use-cases/get-menu-categories.use-case.js';
import { MenuTokens } from '../../infrastructure/persistence/tokens/menu.tokens.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class GetMenuCategoriesController {
  constructor(
    @inject((MenuTokens as any).GetMenuCategoriesUseCase)
    private readonly getCategoriesUseCase: IGetMenuCategoriesUseCase,
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId as string;

      const result = await this.getCategoriesUseCase.execute(restaurantId);

      sendResponse(res, 200, {
        success: true,
        message: 'Menu categories retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
