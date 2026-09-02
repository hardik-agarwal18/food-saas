import { registerInfrastructure } from './modules/infrastructure.js';
import { registerRestaurant } from './modules/restaurant.js';
import { registerAdmin } from './modules/admin.js';
import { registerCustomer } from './modules/customer.js';
import { registerDelivery } from './modules/delivery.js';
import { registerDriver } from './modules/driver.js';
import { registerOrdering } from './modules/ordering.js';
import { registerPayment } from './modules/payment.js';
import { registerIdentity } from './modules/identity.js';

export const registerDependencies = (): void => {
  registerInfrastructure();

  registerIdentity();
  registerAdmin();
  registerCustomer();
  registerDelivery();
  registerDriver();
  registerOrdering();
  registerPayment();
  registerRestaurant();

  //Future dependency registrations can be added here
};
