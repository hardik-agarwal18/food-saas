import { injectable, inject } from 'tsyringe';
import { CustomerTokens } from '../../infrastructure/persistence/tokens/customer.tokens.js';
import type { CustomerAvatarUploadUseCase } from '../../application/use-cases/customer-avatar-upload.use-case.js';
import { catchAsync } from '../../../../shared/utils/CatchAsync.js';
import { NextFunction, Request, Response } from 'express';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';
import { BadRequestError } from '../../../../shared/errors/BadRequestError.js';

@injectable()
export class CustomerAvatarUploadController {
  constructor(
    @inject(CustomerTokens.CustomerAvatarUploadUseCase)
    private readonly customerAvatarUploadUseCase: CustomerAvatarUploadUseCase,
  ) {}

  handle = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;

    if (!req.file) {
      throw new BadRequestError('Avatar file is required');
    }

    await this.customerAvatarUploadUseCase.execute({
      userId,

      file: {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
        size: req.file.size,
      },
    });

    sendResponse(res, 200, {
      success: true,
      message: 'Avatar updated successfully',
    });
  });
}
