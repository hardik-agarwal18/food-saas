import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { CustomerTokens } from '../../infrastructure/persistence/tokens/customer.tokens.js';
import type { IUpdateCustomerAddressUseCase } from '../../application/use-cases/update-customer-address.use-case.impl.js';
import { updateCustomerAddressSchema } from '../validators/customer-address.validator.js';
import { AuthenticationError } from '../../../../shared/errors/AuthenticationError.js';
import { ValidationError } from '../../../../shared/errors/ValidationError.js';
import { CustomerDomainError } from '../../domain/errors/customer-domain.error.js';
import { BadRequestError } from '../../../../shared/errors/BadRequestError.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class UpdateCustomerAddressController {
  constructor(
    @inject(CustomerTokens.UpdateCustomerAddressUseCase)
    private readonly updateCustomerAddressUseCase: IUpdateCustomerAddressUseCase,
  ) {}

  public handle = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id as string;
    const addressId = req.params.addressId as string;

    if (!userId) {
      throw new AuthenticationError('Unauthorized');
    }

    const parseResult = updateCustomerAddressSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw new ValidationError(
        parseResult.error.issues.map((e: any) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      );
    }

    try {
      const address = await this.updateCustomerAddressUseCase.execute({
        addressId,
        userId,
        ...parseResult.data,
      });

      sendResponse(res, 200, {
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
