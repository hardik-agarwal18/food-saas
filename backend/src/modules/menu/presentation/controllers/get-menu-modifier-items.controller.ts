import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { MenuTokens } from '../../infrastructure/persistence/tokens/menu.tokens.js';
import type { IGetMenuModifierItemsUseCase } from '../../application/use-cases/get-menu-modifier-items.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class GetMenuModifierItemsController {
  constructor(
    @inject((MenuTokens as any).GetMenuModifierItemsUseCase)
    private readonly getMenuModifierItemsUseCase: IGetMenuModifierItemsUseCase,
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId as string;
      const modifierGroupId = req.params.modifierGroupId as string;

      const result = await this.getMenuModifierItemsUseCase.execute(restaurantId, modifierGroupId);

      sendResponse(res, 200, {
        success: true,
        message: 'Modifier items retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
