import { container } from 'tsyringe';
import express from 'express';
import { AuthenticationMiddleware } from '../../../../app/middleware/authentication.middleware.js';
import { AuthorizationMiddleware } from '../../../../app/middleware/authorization.middleware.js';
import { Permission } from '../../../identity/domain/enums/permission.enum.js';
import { validate } from '../../../../shared/validation/validate.js';
import {
  createMenuCategorySchema,
  createMenuItemSchema,
  createMenuModifierGroupSchema,
  createMenuModifierItemSchema,
} from '../validators/menu.validator.js';

import { CreateMenuCategoryController } from '../controllers/create-menu-category.controller.js';
import { GetMenuCategoriesController } from '../controllers/get-menu-categories.controller.js';
import { CreateMenuItemController } from '../controllers/create-menu-item.controller.js';
import { GetMenuItemsController } from '../controllers/get-menu-items.controller.js';
import { CreateMenuModifierGroupController } from '../controllers/create-menu-modifier-group.controller.js';
import { GetMenuModifierGroupsController } from '../controllers/get-menu-modifier-groups.controller.js';
import { CreateMenuModifierItemController } from '../controllers/create-menu-modifier-item.controller.js';
import { GetMenuModifierItemsController } from '../controllers/get-menu-modifier-items.controller.js';

const router = express.Router({ mergeParams: true }); // Important: to access restaurantId from parent

const auth = container.resolve(AuthenticationMiddleware);
const authz = container.resolve(AuthorizationMiddleware);

const createMenuCategoryController = container.resolve(CreateMenuCategoryController);
const getMenuCategoriesController = container.resolve(GetMenuCategoriesController);
const createMenuItemController = container.resolve(CreateMenuItemController);
const getMenuItemsController = container.resolve(GetMenuItemsController);
const createMenuModifierGroupController = container.resolve(CreateMenuModifierGroupController);
const getMenuModifierGroupsController = container.resolve(GetMenuModifierGroupsController);
const createMenuModifierItemController = container.resolve(CreateMenuModifierItemController);
const getMenuModifierItemsController = container.resolve(GetMenuModifierItemsController);

// ─── Categories ─────────────────────────────────────────────────────────────
router
  .route('/categories')
  .post(
    auth.authenticate,
    authz.authorize(Permission.MENU_CREATE),
    validate({ body: createMenuCategorySchema }),
    createMenuCategoryController.handle.bind(createMenuCategoryController),
  )
  .get(getMenuCategoriesController.handle.bind(getMenuCategoriesController));

// ─── Items ──────────────────────────────────────────────────────────────────
router
  .route('/items')
  .post(
    auth.authenticate,
    authz.authorize(Permission.MENU_CREATE),
    validate({ body: createMenuItemSchema }),
    createMenuItemController.handle.bind(createMenuItemController),
  )
  .get(getMenuItemsController.handle.bind(getMenuItemsController));

// ─── Modifier Groups ────────────────────────────────────────────────────────
router
  .route('/modifier-groups')
  .post(
    auth.authenticate,
    authz.authorize(Permission.MENU_CREATE),
    validate({ body: createMenuModifierGroupSchema }),
    createMenuModifierGroupController.handle.bind(createMenuModifierGroupController),
  )
  .get(getMenuModifierGroupsController.handle.bind(getMenuModifierGroupsController));

// ─── Modifier Items ─────────────────────────────────────────────────────────
router
  .route('/modifier-groups/:modifierGroupId/items')
  .post(
    auth.authenticate,
    authz.authorize(Permission.MENU_CREATE),
    validate({ body: createMenuModifierItemSchema }),
    createMenuModifierItemController.handle.bind(createMenuModifierItemController),
  )
  .get(getMenuModifierItemsController.handle.bind(getMenuModifierItemsController));

export default router;
