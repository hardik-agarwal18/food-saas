import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import type { ICreateMenuItemUseCase } from '../../application/use-cases/create-menu-item.use-case.js';
import { MenuTokens } from '../../infrastructure/persistence/tokens/menu.tokens.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class CreateMenuItemController {
  constructor(
    @inject((MenuTokens as any).CreateMenuItemUseCase)
    private readonly createMenuItemUseCase: ICreateMenuItemUseCase,
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId as string;
      const userId = req.user!.id;

      const result = await this.createMenuItemUseCase.execute(restaurantId, userId, req.body);

      sendResponse(res, 201, {
        success: true,
        message: 'Menu item created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
