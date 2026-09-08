import { container } from 'tsyringe';
import { MenuTokens } from '../../../modules/menu/infrastructure/persistence/tokens/menu.tokens.js';

// Repositories
import { MenuCategoryRepositoryImpl } from '../../../modules/menu/infrastructure/persistence/prisma/menu-category.repository.js';
import { MenuItemRepositoryImpl } from '../../../modules/menu/infrastructure/persistence/prisma/menu-item.repository.js';
import { MenuModifierRepositoryImpl } from '../../../modules/menu/infrastructure/persistence/prisma/menu-modifier.repository.js';

// Use Cases
import { CreateMenuCategoryUseCaseImpl } from '../../../modules/menu/application/use-cases/create-menu-category.use-case.impl.js';
import { GetMenuCategoriesUseCaseImpl } from '../../../modules/menu/application/use-cases/get-menu-categories.use-case.impl.js';
import { CreateMenuItemUseCaseImpl } from '../../../modules/menu/application/use-cases/create-menu-item.use-case.impl.js';
import { GetMenuItemsUseCaseImpl } from '../../../modules/menu/application/use-cases/get-menu-items.use-case.impl.js';
import { CreateMenuModifierGroupUseCaseImpl } from '../../../modules/menu/application/use-cases/create-menu-modifier-group.use-case.impl.js';
import { GetMenuModifierGroupsUseCaseImpl } from '../../../modules/menu/application/use-cases/get-menu-modifier-groups.use-case.impl.js';
import { CreateMenuModifierItemUseCaseImpl } from '../../../modules/menu/application/use-cases/create-menu-modifier-item.use-case.impl.js';
import { GetMenuModifierItemsUseCaseImpl } from '../../../modules/menu/application/use-cases/get-menu-modifier-items.use-case.impl.js';

// Controllers
import { CreateMenuCategoryController } from '../../../modules/menu/presentation/controllers/create-menu-category.controller.js';
import { GetMenuCategoriesController } from '../../../modules/menu/presentation/controllers/get-menu-categories.controller.js';
import { CreateMenuItemController } from '../../../modules/menu/presentation/controllers/create-menu-item.controller.js';
import { GetMenuItemsController } from '../../../modules/menu/presentation/controllers/get-menu-items.controller.js';
import { CreateMenuModifierGroupController } from '../../../modules/menu/presentation/controllers/create-menu-modifier-group.controller.js';
import { GetMenuModifierGroupsController } from '../../../modules/menu/presentation/controllers/get-menu-modifier-groups.controller.js';
import { CreateMenuModifierItemController } from '../../../modules/menu/presentation/controllers/create-menu-modifier-item.controller.js';
import { GetMenuModifierItemsController } from '../../../modules/menu/presentation/controllers/get-menu-modifier-items.controller.js';

export function registerMenuModule(): void {

  // Repositories
  container.registerSingleton(MenuTokens.MenuCategoryRepository, MenuCategoryRepositoryImpl);
  container.registerSingleton(MenuTokens.MenuItemRepository, MenuItemRepositoryImpl);
  container.registerSingleton(MenuTokens.MenuModifierRepository, MenuModifierRepositoryImpl);

  // Use Cases
  container.registerSingleton(
    MenuTokens.CreateMenuCategoryUseCase,
    CreateMenuCategoryUseCaseImpl,
  );
  container.registerSingleton(
    MenuTokens.GetMenuCategoriesUseCase,
    GetMenuCategoriesUseCaseImpl,
  );
  container.registerSingleton(MenuTokens.CreateMenuItemUseCase, CreateMenuItemUseCaseImpl);
  container.registerSingleton(MenuTokens.GetMenuItemsUseCase, GetMenuItemsUseCaseImpl);
  container.registerSingleton(
    MenuTokens.CreateMenuModifierGroupUseCase,
    CreateMenuModifierGroupUseCaseImpl,
  );
  container.registerSingleton(
    MenuTokens.GetMenuModifierGroupsUseCase,
    GetMenuModifierGroupsUseCaseImpl,
  );
  container.registerSingleton(
    MenuTokens.CreateMenuModifierItemUseCase,
    CreateMenuModifierItemUseCaseImpl,
  );
  container.registerSingleton(
    MenuTokens.GetMenuModifierItemsUseCase,
    GetMenuModifierItemsUseCaseImpl,
  );

  // Controllers (auto-resolved, but explicit registration guarantees singleton behavior)
  container.registerSingleton(CreateMenuCategoryController);
  container.registerSingleton(GetMenuCategoriesController);
  container.registerSingleton(CreateMenuItemController);
  container.registerSingleton(GetMenuItemsController);
  container.registerSingleton(CreateMenuModifierGroupController);
  container.registerSingleton(GetMenuModifierGroupsController);
  container.registerSingleton(CreateMenuModifierItemController);
  container.registerSingleton(GetMenuModifierItemsController);
}
