import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { CustomerTokens } from '../../infrastructure/persistence/tokens/customer.tokens.js';
import type { ISetDefaultCustomerAddressUseCase } from '../../application/use-cases/set-default-customer-address.use-case.impl.js';
import { AuthenticationError } from '../../../../shared/errors/AuthenticationError.js';
import { CustomerDomainError } from '../../domain/errors/customer-domain.error.js';
import { BadRequestError } from '../../../../shared/errors/BadRequestError.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class SetDefaultCustomerAddressController {
  constructor(
    @inject(CustomerTokens.SetDefaultCustomerAddressUseCase)
    private readonly setDefaultCustomerAddressUseCase: ISetDefaultCustomerAddressUseCase,
  ) {}

  public handle = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id as string;
    const addressId = req.params.addressId as string;

    if (!userId) {
      throw new AuthenticationError('Unauthorized');
    }

    try {
      await this.setDefaultCustomerAddressUseCase.execute({
        addressId,
        userId,
      });

      sendResponse(res, 200, {
        success: true,
        message: 'Address set as default successfully',
      });
    } catch (error) {
      if (error instanceof CustomerDomainError) {
        throw new BadRequestError(error.message);
      }
      throw error;
    }
  };
}
