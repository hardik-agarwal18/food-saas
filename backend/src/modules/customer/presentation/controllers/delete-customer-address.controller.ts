import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { CustomerTokens } from '../../infrastructure/persistence/tokens/customer.tokens.js';
import type { IDeleteCustomerAddressUseCase } from '../../application/use-cases/delete-customer-address.use-case.impl.js';
import { AuthenticationError } from '../../../../shared/errors/AuthenticationError.js';
import { CustomerDomainError } from '../../domain/errors/customer-domain.error.js';
import { BadRequestError } from '../../../../shared/errors/BadRequestError.js';

@injectable()
export class DeleteCustomerAddressController {
  constructor(
    @inject(CustomerTokens.DeleteCustomerAddressUseCase)
    private readonly deleteCustomerAddressUseCase: IDeleteCustomerAddressUseCase,
  ) {}

  public handle = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id as string;
    const addressId = req.params.addressId as string;

    if (!userId) {
      throw new AuthenticationError('Unauthorized');
    }

    try {
      await this.deleteCustomerAddressUseCase.execute({
        addressId,
        userId,
      });

      res.status(204).send();
    } catch (error) {
      if (error instanceof CustomerDomainError) {
        throw new BadRequestError(error.message);
      }
      throw error;
    }
  };
}
