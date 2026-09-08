import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { MenuTokens } from '../../infrastructure/persistence/tokens/menu.tokens.js';
import type { ICreateMenuModifierItemUseCase } from '../../application/use-cases/create-menu-modifier-item.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class CreateMenuModifierItemController {
  constructor(
    @inject((MenuTokens as any).CreateMenuModifierItemUseCase)
    private readonly createMenuModifierItemUseCase: ICreateMenuModifierItemUseCase,
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId as string;
      const modifierGroupId = req.params.modifierGroupId as string;
      const userId = req.user!.id;
      const dto = req.body;

      const result = await this.createMenuModifierItemUseCase.execute(
        restaurantId,
        modifierGroupId,
        userId,
        dto,
      );

      sendResponse(res, 201, {
        success: true,
        message: 'Modifier item created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
