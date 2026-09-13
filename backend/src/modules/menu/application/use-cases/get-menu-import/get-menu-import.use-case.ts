import { MenuImport } from '../../../domain/entities/menu-import.entity.js';

export interface GetMenuImportInput {
  importId: string;
  restaurantId: string;
}

export interface GetMenuImportUseCase {
  execute(input: GetMenuImportInput): Promise<MenuImport | null>;
}
