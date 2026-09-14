export const CustomerTokens = {
  CustomerRepository: Symbol.for('Customer.CustomerRepository'),
  CustomerAddressRepository: Symbol.for('Customer.CustomerAddressRepository'),

  CustomerProfileCreationUseCase: Symbol.for('Customer.CustomerProfileCreationUseCase'),

  GetCustomerProfileUseCase: Symbol.for('Customer.GetCustomerProfileUseCase'),

  CustomerProfileUpdateUseCase: Symbol.for('Customer.CustomerProfileUpdateUseCase'),

  CustomerPreferencesUpdateUseCase: Symbol.for('Customer.CustomerPreferencesUpdateUseCase'),

  CustomerAvatarUploadUseCase: Symbol.for('Customer.CustomerAvatarUploadUseCase'),

  CustomerAvatarRemoveUseCase: Symbol.for('Customer.CustomerAvatarRemoveUseCase'),

  CustomerAvatarUploadWithoutStreamUseCase: Symbol.for(
    'Customer.CustomerAvatarUploadWithoutStreamUseCase',
  ),

  AddCustomerAddressUseCase: Symbol.for('Customer.AddCustomerAddressUseCase'),
  UpdateCustomerAddressUseCase: Symbol.for('Customer.UpdateCustomerAddressUseCase'),
  DeleteCustomerAddressUseCase: Symbol.for('Customer.DeleteCustomerAddressUseCase'),
  GetCustomerAddressesUseCase: Symbol.for('Customer.GetCustomerAddressesUseCase'),
  SetDefaultCustomerAddressUseCase: Symbol.for('Customer.SetDefaultCustomerAddressUseCase'),
} as const;
