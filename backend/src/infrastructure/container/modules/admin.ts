import { container } from 'tsyringe';
import { AdminTokens } from '../../../modules/admin/infrastructure/tokens/admin.tokens.js';
import { GetPendingRestaurantsUseCaseImpl } from '../../../modules/admin/application/use-cases/get-pending-restaurants.use-case.impl.js';
import { SuspendUserUseCaseImpl } from '../../../modules/admin/application/use-cases/suspend-user.use-case.impl.js';

export function registerAdminModule() {
  container.registerSingleton(
    AdminTokens.GetPendingRestaurantsUseCase,
    GetPendingRestaurantsUseCaseImpl,
  );
  container.registerSingleton(AdminTokens.SuspendUserUseCase, SuspendUserUseCaseImpl);
}
