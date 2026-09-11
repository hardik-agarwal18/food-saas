import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { MenuTokens } from '../../infrastructure/persistence/tokens/menu.tokens.js';
import type { IGetMenuModifierGroupsUseCase } from '../../application/use-cases/get-menu-modifier-groups.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class GetMenuModifierGroupsController {
  constructor(
    @inject((MenuTokens as any).GetMenuModifierGroupsUseCase)
    private readonly getMenuModifierGroupsUseCase: IGetMenuModifierGroupsUseCase,
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId as string;

      const result = await this.getMenuModifierGroupsUseCase.execute(restaurantId);

      sendResponse(res, 200, {
        success: true,
        message: 'Modifier groups retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
