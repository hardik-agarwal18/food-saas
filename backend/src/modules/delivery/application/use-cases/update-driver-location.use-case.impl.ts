import { inject, injectable } from 'tsyringe';
import { IUpdateDriverLocationUseCase } from './update-driver-location.use-case.js';
import type { IDriverRepository } from '../../domain/repositories/driver.repository.js';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';
import { DeliveryDomainError } from '../../domain/errors/delivery-domain.error.js';

@injectable()
export class UpdateDriverLocationUseCaseImpl implements IUpdateDriverLocationUseCase {
  constructor(
    @inject(DeliveryTokens.DriverRepository)
    private readonly driverRepository: IDriverRepository,
  ) {}

  async execute(userId: string, latitude: number, longitude: number): Promise<void> {
    const driver = await this.driverRepository.findByUserId(userId);
    if (!driver) {
      throw new DeliveryDomainError('Driver profile not found.', 'DRIVER_NOT_FOUND');
    }

    driver.updateLocation(latitude, longitude);
    await this.driverRepository.save(driver);
  }
}
