import { inject, injectable } from 'tsyringe';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';
import type { IDriverRepository } from '../../domain/repositories/driver.repository.js';
import { NotFoundError } from '../../../../shared/errors/NotFoundError.js';

export interface IGetDriverProfileUseCase {
  execute(userId: string): Promise<any>;
}

@injectable()
export class GetDriverProfileUseCase implements IGetDriverProfileUseCase {
  constructor(
    @inject(DeliveryTokens.DriverRepository)
    private readonly driverRepository: IDriverRepository,
  ) {}

  async execute(userId: string) {
    const driver = await this.driverRepository.findByUserId(userId);
    if (!driver) {
      throw new NotFoundError(`Driver profile for user ${userId} not found`);
    }

    return {
      id: driver.id,
      userId: driver.userId,
      firstName: driver.firstName,
      lastName: driver.lastName,
      phone: driver.phone,
      vehicleType: driver.vehicleType,
      vehiclePlateNumber: driver.vehiclePlateNumber,
      status: driver.status,
    };
  }
}
