import { container } from 'tsyringe';
import { CustomerTokens } from '../../../modules/customer/infrastructure/persistence/tokens/customer.tokens.js';
import { CustomerRepository } from '../../../modules/customer/infrastructure/persistence/prisma/customer.repository.js';
import { PrismaCustomerAddressRepository } from '../../../modules/customer/infrastructure/persistence/prisma/customer-address.repository.js';

import { CustomerProfileCreationUseCaseImpl } from '../../../modules/customer/application/use-cases/customer-profile-creation.use-case.impl.js';
import { GetCustomerProfileUseCaseImpl } from '../../../modules/customer/application/use-cases/get-customer-profile.use-case.impl.js';
import { CustomerProfileUpdateUseCaseImpl } from '../../../modules/customer/application/use-cases/customer-profile-update.use-case.impl.js';
import { CustomerPreferencesUpdateUseCaseImpl } from '../../../modules/customer/application/use-cases/customer-preferences-update.use-case.impl.js';
import { CustomerAvatarUploadUseCaseImpl } from '../../../modules/customer/application/use-cases/customer-avatar-upload.use-case.impl.js';
import { CustomerAvatarRemoveUseCaseImpl } from '../../../modules/customer/application/use-cases/customer-avatar-remove.use-case.impl.js';
import { CustomerAvatarUploadWithoutStreamUseCaseImpl } from '../../../modules/customer/application/use-cases/customer-avatar-upload-without-stream.use-case.impl.js';
import { AddCustomerAddressUseCaseImpl } from '../../../modules/customer/application/use-cases/add-customer-address.use-case.impl.js';
import { UpdateCustomerAddressUseCaseImpl } from '../../../modules/customer/application/use-cases/update-customer-address.use-case.impl.js';
import { DeleteCustomerAddressUseCaseImpl } from '../../../modules/customer/application/use-cases/delete-customer-address.use-case.impl.js';
import { GetCustomerAddressesUseCaseImpl } from '../../../modules/customer/application/use-cases/get-customer-addresses.use-case.impl.js';
import { SetDefaultCustomerAddressUseCaseImpl } from '../../../modules/customer/application/use-cases/set-default-customer-address.use-case.impl.js';

export const registerCustomer = (): void => {
  container.register(CustomerTokens.CustomerRepository, {
    useClass: CustomerRepository,
  });

  container.register(CustomerTokens.CustomerAddressRepository, {
    useClass: PrismaCustomerAddressRepository,
  });

  container.registerSingleton(
    CustomerTokens.CustomerProfileCreationUseCase,
    CustomerProfileCreationUseCaseImpl,
  );

  container.registerSingleton(
    CustomerTokens.GetCustomerProfileUseCase,
    GetCustomerProfileUseCaseImpl,
  );

  container.registerSingleton(
    CustomerTokens.CustomerProfileUpdateUseCase,
    CustomerProfileUpdateUseCaseImpl,
  );

  container.registerSingleton(
    CustomerTokens.CustomerPreferencesUpdateUseCase,
    CustomerPreferencesUpdateUseCaseImpl,
  );

  container.registerSingleton(
    CustomerTokens.CustomerAvatarUploadUseCase,
    CustomerAvatarUploadUseCaseImpl,
  );

  container.registerSingleton(
    CustomerTokens.CustomerAvatarRemoveUseCase,
    CustomerAvatarRemoveUseCaseImpl,
  );

  container.registerSingleton(
    CustomerTokens.CustomerAvatarUploadWithoutStreamUseCase,
    CustomerAvatarUploadWithoutStreamUseCaseImpl,
  );

  container.registerSingleton(
    CustomerTokens.AddCustomerAddressUseCase,
    AddCustomerAddressUseCaseImpl,
  );

  container.registerSingleton(
    CustomerTokens.UpdateCustomerAddressUseCase,
    UpdateCustomerAddressUseCaseImpl,
  );

  container.registerSingleton(
    CustomerTokens.DeleteCustomerAddressUseCase,
    DeleteCustomerAddressUseCaseImpl,
  );

  container.registerSingleton(
    CustomerTokens.GetCustomerAddressesUseCase,
    GetCustomerAddressesUseCaseImpl,
  );

  container.registerSingleton(
    CustomerTokens.SetDefaultCustomerAddressUseCase,
    SetDefaultCustomerAddressUseCaseImpl,
  );
};
