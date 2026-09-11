import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import type { IGetMenuItemsUseCase } from '../../application/use-cases/get-menu-items.use-case.js';
import { MenuTokens } from '../../infrastructure/persistence/tokens/menu.tokens.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class GetMenuItemsController {
  constructor(
    @inject((MenuTokens as any).GetMenuItemsUseCase)
    private readonly getMenuItemsUseCase: IGetMenuItemsUseCase,
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId as string;
      const categoryId = req.query.categoryId as string | undefined;

      const result = await this.getMenuItemsUseCase.execute(restaurantId, categoryId);

      sendResponse(res, 200, {
        success: true,
        message: 'Menu items retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
