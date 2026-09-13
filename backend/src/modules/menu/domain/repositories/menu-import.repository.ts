import { MenuImport } from '../entities/menu-import.entity.js';

export interface MenuImportRepository {
  /**
   * Find a menu import by its ID
   */
  findById(id: string): Promise<MenuImport | null>;

  /**
   * Find a menu import by its ID for update (locking or optimistic locking)
   */
  findByIdForUpdate(id: string): Promise<MenuImport | null>;

  /**
   * Save a new menu import
   */
  create(menuImport: MenuImport): Promise<void>;

  /**
   * Update an existing menu import (checks version for optimistic concurrency)
   */
  save(menuImport: MenuImport): Promise<void>;
}
