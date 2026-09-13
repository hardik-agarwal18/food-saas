import { inject, injectable } from 'tsyringe';
import { MenuTokens } from '../../../infrastructure/tokens/menu.tokens.js';
import type { MenuImportRepository } from '../../../domain/repositories/menu-import.repository.js';
import { RestaurantTokens } from '../../../../restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IRestaurantRepository } from '../../../../restaurant/domain/repositories/restaurant.repository.js';
import type {
  ConfirmMenuImportInput,
  ConfirmMenuImportUseCase,
} from './confirm-menu-import.use-case.js';
import { MenuDomainError } from '../../../domain/errors/menu-domain.error.js';
import { ConflictError } from '../../../../../shared/errors/ConflictError.js';
import { withTransaction } from '../../../../../infrastructure/database/transaction.js';
import { MenuCategory } from '../../../domain/entities/menu-category.entity.js';
import { MenuItem } from '../../../domain/entities/menu-item.entity.js';
import { MenuCategoryMapper } from '../../../infrastructure/persistence/prisma/mappers/menu-category.mapper.js';
import { MenuItemMapper } from '../../../infrastructure/persistence/prisma/mappers/menu-item.mapper.js';
import { EventDispatcher } from '../../../../../shared/events/event-dispatcher.js';
import {
  MenuImportConfirmedEvent,
  MenuImportedEvent,
} from '../../../domain/events/menu-import.events.js';
import { Money } from '../../../domain/value-objects/money.vo.js';

@injectable()
export class ConfirmMenuImportUseCaseImpl implements ConfirmMenuImportUseCase {
  constructor(
    @inject(MenuTokens.MenuImportRepository)
    private readonly menuImportRepository: MenuImportRepository,
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  async execute(input: ConfirmMenuImportInput): Promise<void> {
    const importEntity = await this.menuImportRepository.findByIdForUpdate(input.importId);

    if (!importEntity) {
      throw new MenuDomainError('Menu import not found');
    }

    if (importEntity.getRestaurantId() !== input.restaurantId) {
      throw new MenuDomainError('Unauthorized access to menu import');
    }

    const restaurant = await this.restaurantRepo.findById(input.restaurantId);
    if (!restaurant) {
      throw new MenuDomainError('Restaurant not found');
    }
    if (restaurant.getOwnerId() !== input.actorId) {
      throw new MenuDomainError('Unauthorized to modify this restaurant menu');
    }

    // Support edits before confirmation
    if (input.editedData) {
      importEntity.editExtraction(input.editedData);
    }

    // Domain enforces that it must be in READY_FOR_REVIEW
    importEntity.confirm();

    // We mark it imported right away here as we will process the import synchronously in a transaction
    importEntity.markImported();

    // Perform atomic transaction
    await withTransaction(async (tx) => {
      const extractedData = importEntity.getExtractedData();
      if (!extractedData || !extractedData.categories) {
        throw new MenuDomainError('Invalid extracted data');
      }

      let categorySortOrder = 0;
      for (const catData of extractedData.categories) {
        // Create Domain Entity
        const category = MenuCategory.create({
          restaurantId: input.restaurantId,
          name: catData.name,
          description: catData.description || null,
          sortOrder: categorySortOrder++,
        });

        // Persist via transaction
        const catInput = MenuCategoryMapper.toCreateInput(category);
        await tx.menuCategory.create({ data: catInput });

        if (catData.items) {
          let itemSortOrder = 0;
          for (const itemData of catData.items) {
            const item = MenuItem.create({
              restaurantId: input.restaurantId,
              categoryId: category.getId(),
              name: itemData.name,
              description: itemData.description || null,
              price: Money.fromNumber(Number(itemData.price)),
              sortOrder: itemSortOrder++,
            });

            const itemInput = MenuItemMapper.toCreateInput(item);
            await tx.menuItem.create({ data: itemInput });
          }
        }
      }

      // Update import status in the same transaction
      // Instead of using the repository (which uses its own transaction/connection),
      // we must use the raw transaction client `tx`.
      const importData = {
        status: importEntity.getStatus(),
        extractedData: importEntity.getExtractedData(),
        confirmedAt: importEntity.getConfirmedAt(),
        importedAt: importEntity.getImportedAt(),
        updatedAt: new Date(),
        version: importEntity.getVersion() + 1,
      };

      const result = await tx.menuImport.updateMany({
        where: { id: importEntity.getId(), version: importEntity.getVersion() },
        data: importData,
      });

      if (result.count === 0) {
        throw new ConflictError(
          'Optimistic concurrency control failed. The entity was modified by another transaction.',
        );
      }
    });

    EventDispatcher.getInstance().dispatch(
      new MenuImportConfirmedEvent(importEntity.getId(), importEntity.getRestaurantId()),
    );
    EventDispatcher.getInstance().dispatch(
      new MenuImportedEvent(importEntity.getId(), importEntity.getRestaurantId()),
    );
  }
}
