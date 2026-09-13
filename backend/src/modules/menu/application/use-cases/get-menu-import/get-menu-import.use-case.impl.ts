import { inject, injectable } from 'tsyringe';
import { MenuTokens } from '../../../infrastructure/persistence/tokens/menu.tokens.js';
import type { MenuImportRepository } from '../../../domain/repositories/menu-import.repository.js';
import type { GetMenuImportInput, GetMenuImportUseCase } from './get-menu-import.use-case.js';
import { MenuImport } from '../../../domain/entities/menu-import.entity.js';
import { MenuDomainError } from '../../../domain/errors/menu-domain.error.js';

@injectable()
export class GetMenuImportUseCaseImpl implements GetMenuImportUseCase {
  constructor(
    @inject(MenuTokens.MenuImportRepository)
    private readonly menuImportRepository: MenuImportRepository,
  ) {}

  async execute(input: GetMenuImportInput): Promise<MenuImport | null> {
    const importEntity = await this.menuImportRepository.findById(input.importId);

    if (importEntity && importEntity.getRestaurantId() !== input.restaurantId) {
      throw new MenuDomainError('Unauthorized access to menu import');
    }

    return importEntity;
  }
}
