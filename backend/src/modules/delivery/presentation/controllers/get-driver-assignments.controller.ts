import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';
import type { IGetDriverAssignmentsUseCase } from '../../application/use-cases/get-driver-assignments.use-case.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class GetDriverAssignmentsController {
  constructor(
    @inject(DeliveryTokens.GetDriverAssignmentsUseCase)
    private readonly getDriverAssignmentsUseCase: IGetDriverAssignmentsUseCase,
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const assignments = await this.getDriverAssignmentsUseCase.execute(userId);
      sendResponse(res, 200, { success: true, message: 'Success', data: assignments });
    } catch (error) {
      next(error);
    }
  }
}
