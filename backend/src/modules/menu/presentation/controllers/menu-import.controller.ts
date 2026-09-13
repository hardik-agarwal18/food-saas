import { injectable, inject } from 'tsyringe';
import { Request, Response } from 'express';
import { catchAsync } from '../../../../shared/utils/CatchAsync.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';
import { MenuTokens } from '../../infrastructure/tokens/menu.tokens.js';
import type { CreateMenuImportUseCase } from '../../application/use-cases/create-menu-import/create-menu-import.use-case.js';
import type { GetMenuImportUseCase } from '../../application/use-cases/get-menu-import/get-menu-import.use-case.js';
import type { ConfirmMenuImportUseCase } from '../../application/use-cases/confirm-menu-import/confirm-menu-import.use-case.js';
import type { RetryMenuImportUseCase } from '../../application/use-cases/retry-menu-import/retry-menu-import.use-case.js';
import { BadRequestError } from '../../../../shared/errors/BadRequestError.js';
import { NotFoundError } from '../../../../shared/errors/NotFoundError.js';
import { MenuImportMapper } from '../../infrastructure/persistence/prisma/mappers/menu-import.mapper.js';

@injectable()
export class MenuImportController {
  constructor(
    @inject(MenuTokens.CreateMenuImportUseCase)
    private readonly createMenuImportUseCase: CreateMenuImportUseCase,
    @inject(MenuTokens.GetMenuImportUseCase)
    private readonly getMenuImportUseCase: GetMenuImportUseCase,
    @inject(MenuTokens.ConfirmMenuImportUseCase)
    private readonly confirmMenuImportUseCase: ConfirmMenuImportUseCase,
    @inject(MenuTokens.RetryMenuImportUseCase)
    private readonly retryMenuImportUseCase: RetryMenuImportUseCase,
  ) {}

  public upload = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId as string;

    if (!req.file) {
      throw new BadRequestError('Menu document file is required');
    }

    const actorId = req.user!.id;

    const result = await this.createMenuImportUseCase.execute({
      restaurantId,
      actorId,
      mimeType: req.file.mimetype,
      buffer: req.file.buffer,
      contentLength: req.file.size,
    });

    sendResponse(res, 202, {
      success: true,
      message: 'Menu import created and processing started',
      data: result,
    });
  });

  public get = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId as string;
    const importId = req.params.importId as string;
    const actorId = req.user!.id;

    const result = await this.getMenuImportUseCase.execute({ restaurantId, importId, actorId });

    if (!result) {
      throw new NotFoundError('Menu import not found');
    }
    
    // Create safe DTO that excludes raw OCR text
    const persistence = MenuImportMapper.toPersistence(result);
    const { rawOcrText, ...safeDto } = persistence as any;

    sendResponse(res, 200, {
      success: true,
      message: 'Menu import retrieved',
      data: safeDto,
    });
  });

  public confirm = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId as string;
    const importId = req.params.importId as string;
    const actorId = req.user!.id;
    const { editedData } = req.body;

    await this.confirmMenuImportUseCase.execute({
      restaurantId,
      importId,
      actorId,
      editedData,
    });

    sendResponse(res, 200, {
      success: true,
      message: 'Menu imported successfully',
    });
  });

  public retry = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId as string;
    const importId = req.params.importId as string;
    const actorId = req.user!.id;

    await this.retryMenuImportUseCase.execute({
      restaurantId,
      importId,
      actorId,
    });

    sendResponse(res, 202, {
      success: true,
      message: 'Menu import retry started',
    });
  });
}
