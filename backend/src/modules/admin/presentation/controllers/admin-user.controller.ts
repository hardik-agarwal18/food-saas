import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { AdminTokens } from '../../infrastructure/tokens/admin.tokens.js';
import type { ISuspendUserUseCase } from '../../application/use-cases/suspend-user.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class AdminUserController {
  constructor(
    @inject(AdminTokens.SuspendUserUseCase)
    private readonly suspendUserUseCase: ISuspendUserUseCase,
  ) {}

  async suspend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await this.suspendUserUseCase.execute(id);
      sendResponse(res, 200, { success: true, message: 'User suspended successfully' });
    } catch (error) {
      next(error);
    }
  }
}
