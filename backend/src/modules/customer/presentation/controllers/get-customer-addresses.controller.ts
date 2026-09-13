import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { CustomerTokens } from '../../infrastructure/persistence/tokens/customer.tokens.js';
import type { IGetCustomerAddressesUseCase } from '../../application/use-cases/get-customer-addresses.use-case.impl.js';
import { AuthenticationError } from '../../../../shared/errors/AuthenticationError.js';
import { sendResponse } from '../../../../shared/utils/AppResponse.js';

@injectable()
export class GetCustomerAddressesController {
  constructor(
    @inject(CustomerTokens.GetCustomerAddressesUseCase)
    private readonly getCustomerAddressesUseCase: IGetCustomerAddressesUseCase,
  ) {}

  public handle = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id as string;

    if (!userId) {
      throw new AuthenticationError('Unauthorized');
    }

    const addresses = await this.getCustomerAddressesUseCase.execute(userId);

    sendResponse(res, 200, {
      success: true,
      message: 'Success',
      data: addresses.map((addr) => addr.toPrimitives()),
    });
  };
}
