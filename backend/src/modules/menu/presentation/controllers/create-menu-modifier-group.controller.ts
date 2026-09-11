import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { MenuTokens } from '../../infrastructure/persistence/tokens/menu.tokens.js';
import type { ICreateMenuModifierGroupUseCase } from '../../application/use-cases/create-menu-modifier-group.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class CreateMenuModifierGroupController {
  constructor(
    @inject((MenuTokens as any).CreateMenuModifierGroupUseCase)
    private readonly createMenuModifierGroupUseCase: ICreateMenuModifierGroupUseCase,
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId as string;
      const userId = req.user!.id;
      const dto = req.body;

      const result = await this.createMenuModifierGroupUseCase.execute(restaurantId, userId, dto);

      sendResponse(res, 201, {
        success: true,
        message: 'Modifier group created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
