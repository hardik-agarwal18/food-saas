import { registerInfrastructure } from './modules/infrastructure.js';

export const registerDependencies = (): void => {
  registerInfrastructure();

  //Future dependency registrations can be added here
};
