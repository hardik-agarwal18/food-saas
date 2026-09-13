import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { CustomerTokens } from '../../infrastructure/persistence/tokens/customer.tokens.js';
import type { IAddCustomerAddressUseCase } from '../../application/use-cases/add-customer-address.use-case.impl.js';
import { addCustomerAddressSchema } from '../validators/customer-address.validator.js';
import { AuthenticationError } from '../../../../shared/errors/AuthenticationError.js';
import { ValidationError } from '../../../../shared/errors/ValidationError.js';
import { CustomerDomainError } from '../../domain/errors/customer-domain.error.js';
import { BadRequestError } from '../../../../shared/errors/BadRequestError.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class AddCustomerAddressController {
  constructor(
    @inject(CustomerTokens.AddCustomerAddressUseCase)
    private readonly addCustomerAddressUseCase: IAddCustomerAddressUseCase,
  ) {}

  public handle = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id as string;
    console.log('Controller userId:', userId, 'Req user:', req.user);

    if (!userId) {
      throw new AuthenticationError('Unauthorized');
    }

    const parseResult = addCustomerAddressSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw new ValidationError(
        parseResult.error.issues.map((e: any) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      );
    }

    try {
      const address = await this.addCustomerAddressUseCase.execute({
        userId,
        ...parseResult.data,
      });

      sendResponse(res, 201, {
        success: true,
        message: 'Success',
        data: address.toPrimitives(),
      });
    } catch (error) {
      if (error instanceof CustomerDomainError) {
        throw new BadRequestError(error.message);
      }
      throw error;
    }
  };
}
