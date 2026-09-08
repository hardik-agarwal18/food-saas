import { container } from 'tsyringe';
import { RestaurantTokens } from '../../../modules/restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import { RestaurantRepositoryImpl } from '../../../modules/restaurant/infrastructure/persistence/prisma/restaurant.repository.js';
import { CreateRestaurantUseCaseImpl } from '../../../modules/restaurant/application/use-cases/create-restaurant.use-case.impl.js';
import { GetRestaurantByIdUseCaseImpl } from '../../../modules/restaurant/application/use-cases/get-restaurant-by-id.use-case.impl.js';
import { GetMyRestaurantsUseCaseImpl } from '../../../modules/restaurant/application/use-cases/get-my-restaurants.use-case.impl.js';
import { GetRestaurantsUseCaseImpl } from '../../../modules/restaurant/application/use-cases/get-restaurants.use-case.impl.js';
import { UpdateRestaurantUseCaseImpl } from '../../../modules/restaurant/application/use-cases/update-restaurant.use-case.impl.js';
import { DeleteRestaurantUseCaseImpl } from '../../../modules/restaurant/application/use-cases/delete-restaurant.use-case.impl.js';
import { ActivateRestaurantUseCaseImpl } from '../../../modules/restaurant/application/use-cases/activate-restaurant.use-case.impl.js';
import { DeactivateRestaurantUseCaseImpl } from '../../../modules/restaurant/application/use-cases/deactivate-restaurant.use-case.impl.js';
import { SuspendRestaurantUseCaseImpl } from '../../../modules/restaurant/application/use-cases/suspend-restaurant.use-case.impl.js';
import { ApproveRestaurantUseCaseImpl } from '../../../modules/restaurant/application/use-cases/approve-restaurant.use-case.impl.js';
import { CreateRestaurantController } from '../../../modules/restaurant/presentation/controllers/create-restaurant.controller.js';
import { GetRestaurantByIdController } from '../../../modules/restaurant/presentation/controllers/get-restaurant-by-id.controller.js';
import { GetMyRestaurantsController } from '../../../modules/restaurant/presentation/controllers/get-my-restaurants.controller.js';
import { GetRestaurantsController } from '../../../modules/restaurant/presentation/controllers/get-restaurants.controller.js';
import { UpdateRestaurantController } from '../../../modules/restaurant/presentation/controllers/update-restaurant.controller.js';
import { DeleteRestaurantController } from '../../../modules/restaurant/presentation/controllers/delete-restaurant.controller.js';
import { ActivateRestaurantController } from '../../../modules/restaurant/presentation/controllers/activate-restaurant.controller.js';
import { DeactivateRestaurantController } from '../../../modules/restaurant/presentation/controllers/deactivate-restaurant.controller.js';
import { SuspendRestaurantController } from '../../../modules/restaurant/presentation/controllers/suspend-restaurant.controller.js';
import { ApproveRestaurantController } from '../../../modules/restaurant/presentation/controllers/approve-restaurant.controller.js';

export const registerRestaurant = (): void => {
  container.register(RestaurantTokens.RestaurantRepository, {
    useClass: RestaurantRepositoryImpl,
  });

  container.registerSingleton(
    RestaurantTokens.CreateRestaurantUseCase,
    CreateRestaurantUseCaseImpl,
  );
  container.registerSingleton(
    RestaurantTokens.GetRestaurantByIdUseCase,
    GetRestaurantByIdUseCaseImpl,
  );
  container.registerSingleton(
    RestaurantTokens.GetMyRestaurantsUseCase,
    GetMyRestaurantsUseCaseImpl,
  );
  container.registerSingleton(RestaurantTokens.GetRestaurantsUseCase, GetRestaurantsUseCaseImpl);
  container.registerSingleton(
    RestaurantTokens.UpdateRestaurantUseCase,
    UpdateRestaurantUseCaseImpl,
  );
  container.registerSingleton(
    RestaurantTokens.DeleteRestaurantUseCase,
    DeleteRestaurantUseCaseImpl,
  );
  container.registerSingleton(
    RestaurantTokens.ActivateRestaurantUseCase,
    ActivateRestaurantUseCaseImpl,
  );
  container.registerSingleton(
    RestaurantTokens.DeactivateRestaurantUseCase,
    DeactivateRestaurantUseCaseImpl,
  );
  container.registerSingleton(
    RestaurantTokens.SuspendRestaurantUseCase,
    SuspendRestaurantUseCaseImpl,
  );
  container.registerSingleton(
    RestaurantTokens.ApproveRestaurantUseCase,
    ApproveRestaurantUseCaseImpl,
  );

  container.registerSingleton(CreateRestaurantController);
  container.registerSingleton(GetRestaurantByIdController);
  container.registerSingleton(GetMyRestaurantsController);
  container.registerSingleton(GetRestaurantsController);
  container.registerSingleton(UpdateRestaurantController);
  container.registerSingleton(DeleteRestaurantController);
  container.registerSingleton(ActivateRestaurantController);
  container.registerSingleton(DeactivateRestaurantController);
  container.registerSingleton(SuspendRestaurantController);
  container.registerSingleton(ApproveRestaurantController);
};
