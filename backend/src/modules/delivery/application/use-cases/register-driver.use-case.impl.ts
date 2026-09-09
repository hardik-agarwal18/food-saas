import { inject, injectable } from 'tsyringe';
import type { IRegisterDriverUseCase, RegisterDriverDto } from './register-driver.use-case.js';
import type { IDriverRepository } from '../../domain/repositories/driver.repository.js';
import { Driver, DriverStatus, VehicleType } from '../../domain/entities/driver.entity.js';
import { DeliveryDomainError } from '../../domain/errors/delivery-domain.error.js';
import { DeliveryTokens } from '../../infrastructure/tokens/delivery.tokens.js';
import crypto from 'crypto';

@injectable()
export class RegisterDriverUseCaseImpl implements IRegisterDriverUseCase {
  constructor(
    @inject(DeliveryTokens.DriverRepository)
    private readonly driverRepository: IDriverRepository,
  ) {}

  async execute(data: RegisterDriverDto): Promise<void> {
    const existing = await this.driverRepository.findByUserId(data.userId);
    if (existing) {
      throw new DeliveryDomainError(
        'Driver profile already exists for this user.',
        'DRIVER_ALREADY_EXISTS',
      );
    }

    const driver = Driver.create({
      id: crypto.randomUUID(),
      userId: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      vehicleType: data.vehicleType as VehicleType,
      vehiclePlateNumber: data.vehiclePlateNumber || null,
      status: DriverStatus.OFFLINE,
      currentLocation: null,
      lastLocationAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.driverRepository.save(driver);
  }
}
