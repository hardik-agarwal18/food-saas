export const MenuTokens = {
  MenuCategoryRepository: Symbol.for('Menu.MenuCategoryRepository'),
  MenuItemRepository: Symbol.for('Menu.MenuItemRepository'),
  MenuModifierRepository: Symbol.for('Menu.MenuModifierRepository'),

  CreateMenuCategoryUseCase: Symbol.for('Menu.CreateMenuCategoryUseCase'),
  GetMenuCategoriesUseCase: Symbol.for('Menu.GetMenuCategoriesUseCase'),
  CreateMenuItemUseCase: Symbol.for('Menu.CreateMenuItemUseCase'),
  GetMenuItemsUseCase: Symbol.for('Menu.GetMenuItemsUseCase'),
  CreateMenuModifierGroupUseCase: Symbol.for('Menu.CreateMenuModifierGroupUseCase'),
  GetMenuModifierGroupsUseCase: Symbol.for('Menu.GetMenuModifierGroupsUseCase'),
  CreateMenuModifierItemUseCase: Symbol.for('Menu.CreateMenuModifierItemUseCase'),
  GetMenuModifierItemsUseCase: Symbol.for('Menu.GetMenuModifierItemsUseCase'),

  MenuImportRepository: Symbol.for('Menu.MenuImportRepository'),
  MenuDocumentReader: Symbol.for('Menu.MenuDocumentReader'),
  MenuParser: Symbol.for('Menu.MenuParser'),

  CreateMenuImportUseCase: Symbol.for('Menu.CreateMenuImportUseCase'),
  ProcessMenuImportUseCase: Symbol.for('Menu.ProcessMenuImportUseCase'),
  GetMenuImportUseCase: Symbol.for('Menu.GetMenuImportUseCase'),
  ConfirmMenuImportUseCase: Symbol.for('Menu.ConfirmMenuImportUseCase'),
  RetryMenuImportUseCase: Symbol.for('Menu.RetryMenuImportUseCase'),
};
