import { inject, injectable } from 'tsyringe';
import type { IToggleDriverAvailabilityUseCase } from './toggle-driver-availability.use-case.js';
import type { IDriverRepository } from '../../domain/repositories/driver.repository.js';
import { DeliveryDomainError } from '../../domain/errors/delivery-domain.error.js';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';

@injectable()
export class ToggleDriverAvailabilityUseCaseImpl implements IToggleDriverAvailabilityUseCase {
  constructor(
    @inject(DeliveryTokens.DriverRepository)
    private readonly driverRepository: IDriverRepository,
  ) {}

  async execute(userId: string, isAvailable: boolean): Promise<void> {
    const driver = await this.driverRepository.findByUserId(userId);
    if (!driver) {
      throw new DeliveryDomainError('Driver profile not found.', 'DRIVER_NOT_FOUND');
    }

    if (isAvailable) {
      driver.goOnline();
    } else {
      driver.goOffline();
    }

    await this.driverRepository.save(driver);
  }
}
