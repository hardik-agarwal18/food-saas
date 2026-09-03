/**
 * Central dependency-registration coordinator.
 *
 * This file coordinates dependency registration for all application
 * modules.
 *
 * Responsibilities:
 * - Import each module-specific registration function
 * - Execute those registration functions during application startup
 *
 * Why this exists:
 * The application contains several modules, such as:
 * - Infrastructure
 * - Identity
 * - Admin
 * - Customer
 * - Delivery
 * - Driver
 * - Ordering
 * - Payment
 * - Restaurant
 *
 * Each module owns its own dependency registrations.
 * This file only coordinates when those registrations are executed.
 *
 * This keeps the registration process organized and prevents one
 * large file from containing every dependency mapping.
 *
 * Registration flow:
 *
 * registerDependencies()
 *   ├── registerInfrastructure()
 *   ├── registerIdentity()
 *   ├── registerAdmin()
 *   ├── registerCustomer()
 *   ├── registerDelivery()
 *   ├── registerDriver()
 *   ├── registerOrdering()
 *   ├── registerPayment()
 *   └── registerRestaurant()
 */

import { registerInfrastructure } from './modules/infrastructure.js';
import { registerRestaurant } from './modules/restaurant.js';
import { registerAdmin } from './modules/admin.js';
import { registerCustomer } from './modules/customer.js';
import { registerDelivery } from './modules/delivery.js';
import { registerDriver } from './modules/driver.js';
import { registerOrdering } from './modules/ordering.js';
import { registerPayment } from './modules/payment.js';
import { registerIdentity } from './modules/identity.js';

/**
 * Registers dependencies for every application module.
 *
 * The function is intentionally kept as a coordinator.
 * The actual registrations are implemented inside each module's
 * registration file.
 *
 * @returns Nothing. The function modifies the tsyringe container.
 */
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
