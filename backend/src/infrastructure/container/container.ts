/**
 * Dependency-injection container entry point.
 *
 * This file initializes all dependency registrations when it is
 * imported by the application entry point.
 *
 * Responsibilities:
 * - Import the central dependency-registration function
 * - Execute the registration process exactly once during startup
 *
 * Why this file exists:
 * Other parts of the application should not need to know how
 * every service, repository, logger, or infrastructure class is
 * registered.
 *
 * The application only needs to import this file before resolving
 * dependencies from the tsyringe container.
 *
 * Startup flow:
 *
 * main.ts
 *   → import container.ts
 *       → registerDependencies()
 *           → registerInfrastructure()
 *           → registerIdentity()
 *           → registerOtherModules()
 */

import { registerDependencies } from './registration.js';

/**
 * Register all application dependencies.
 *
 * This call executes when this module is imported.
 */
registerDependencies();
