import { container } from 'tsyringe';
import { MenuTokens } from '../../../modules/menu/infrastructure/persistence/tokens/menu.tokens.js';

// Repositories
import { MenuCategoryRepositoryImpl } from '../../../modules/menu/infrastructure/persistence/prisma/menu-category.repository.js';
import { MenuItemRepositoryImpl } from '../../../modules/menu/infrastructure/persistence/prisma/menu-item.repository.js';
import { MenuModifierRepositoryImpl } from '../../../modules/menu/infrastructure/persistence/prisma/menu-modifier.repository.js';
import { MenuImportRepositoryImpl } from '../../../modules/menu/infrastructure/persistence/prisma/menu-import.repository.js';
import { StubMenuDocumentReader } from '../../../modules/menu/infrastructure/ocr/stub-menu-document-reader.js';
import { DefaultMenuParser } from '../../../modules/menu/infrastructure/parsers/default-menu-parser.js';

// Use Cases
import { CreateMenuCategoryUseCaseImpl } from '../../../modules/menu/application/use-cases/create-menu-category.use-case.impl.js';
import { GetMenuCategoriesUseCaseImpl } from '../../../modules/menu/application/use-cases/get-menu-categories.use-case.impl.js';
import { CreateMenuItemUseCaseImpl } from '../../../modules/menu/application/use-cases/create-menu-item.use-case.impl.js';
import { GetMenuItemsUseCaseImpl } from '../../../modules/menu/application/use-cases/get-menu-items.use-case.impl.js';
import { CreateMenuModifierGroupUseCaseImpl } from '../../../modules/menu/application/use-cases/create-menu-modifier-group.use-case.impl.js';
import { GetMenuModifierGroupsUseCaseImpl } from '../../../modules/menu/application/use-cases/get-menu-modifier-groups.use-case.impl.js';
import { CreateMenuModifierItemUseCaseImpl } from '../../../modules/menu/application/use-cases/create-menu-modifier-item.use-case.impl.js';
import { GetMenuModifierItemsUseCaseImpl } from '../../../modules/menu/application/use-cases/get-menu-modifier-items.use-case.impl.js';
import { CreateMenuImportUseCaseImpl } from '../../../modules/menu/application/use-cases/create-menu-import/create-menu-import.use-case.impl.js';
import { ProcessMenuImportUseCaseImpl } from '../../../modules/menu/application/use-cases/process-menu-import/process-menu-import.use-case.impl.js';
import { GetMenuImportUseCaseImpl } from '../../../modules/menu/application/use-cases/get-menu-import/get-menu-import.use-case.impl.js';
import { ConfirmMenuImportUseCaseImpl } from '../../../modules/menu/application/use-cases/confirm-menu-import/confirm-menu-import.use-case.impl.js';
import { RetryMenuImportUseCaseImpl } from '../../../modules/menu/application/use-cases/retry-menu-import/retry-menu-import.use-case.impl.js';

// Controllers
import { CreateMenuCategoryController } from '../../../modules/menu/presentation/controllers/create-menu-category.controller.js';
import { GetMenuCategoriesController } from '../../../modules/menu/presentation/controllers/get-menu-categories.controller.js';
import { CreateMenuItemController } from '../../../modules/menu/presentation/controllers/create-menu-item.controller.js';
import { GetMenuItemsController } from '../../../modules/menu/presentation/controllers/get-menu-items.controller.js';
import { CreateMenuModifierGroupController } from '../../../modules/menu/presentation/controllers/create-menu-modifier-group.controller.js';
import { GetMenuModifierGroupsController } from '../../../modules/menu/presentation/controllers/get-menu-modifier-groups.controller.js';
import { CreateMenuModifierItemController } from '../../../modules/menu/presentation/controllers/create-menu-modifier-item.controller.js';
import { GetMenuModifierItemsController } from '../../../modules/menu/presentation/controllers/get-menu-modifier-items.controller.js';
import { MenuImportController } from '../../../modules/menu/presentation/controllers/menu-import.controller.js';

export function registerMenuModule(): void {
  // Repositories
  container.registerSingleton(MenuTokens.MenuCategoryRepository, MenuCategoryRepositoryImpl);
  container.registerSingleton(MenuTokens.MenuItemRepository, MenuItemRepositoryImpl);
  container.registerSingleton(MenuTokens.MenuModifierRepository, MenuModifierRepositoryImpl);
  container.registerSingleton(MenuTokens.MenuImportRepository, MenuImportRepositoryImpl);
  container.registerSingleton(MenuTokens.MenuDocumentReader, StubMenuDocumentReader);
  container.registerSingleton(MenuTokens.MenuParser, DefaultMenuParser);

  // Use Cases
  container.registerSingleton(MenuTokens.CreateMenuCategoryUseCase, CreateMenuCategoryUseCaseImpl);
  container.registerSingleton(MenuTokens.GetMenuCategoriesUseCase, GetMenuCategoriesUseCaseImpl);
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
  container.registerSingleton(MenuTokens.CreateMenuImportUseCase, CreateMenuImportUseCaseImpl);
  container.registerSingleton(MenuTokens.ProcessMenuImportUseCase, ProcessMenuImportUseCaseImpl);
  container.registerSingleton(MenuTokens.GetMenuImportUseCase, GetMenuImportUseCaseImpl);
  container.registerSingleton(MenuTokens.ConfirmMenuImportUseCase, ConfirmMenuImportUseCaseImpl);
  container.registerSingleton(MenuTokens.RetryMenuImportUseCase, RetryMenuImportUseCaseImpl);

  // Controllers (auto-resolved, but explicit registration guarantees singleton behavior)
  container.registerSingleton(CreateMenuCategoryController);
  container.registerSingleton(GetMenuCategoriesController);
  container.registerSingleton(CreateMenuItemController);
  container.registerSingleton(GetMenuItemsController);
  container.registerSingleton(CreateMenuModifierGroupController);
  container.registerSingleton(GetMenuModifierGroupsController);
  container.registerSingleton(CreateMenuModifierItemController);
  container.registerSingleton(GetMenuModifierItemsController);
  container.registerSingleton(MenuImportController);
}
