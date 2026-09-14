import { inject, injectable } from 'tsyringe';
import { MenuTokens } from '../../../infrastructure/tokens/menu.tokens.js';
import type { MenuImportRepository } from '../../../domain/repositories/menu-import.repository.js';
import type { RetryMenuImportInput, RetryMenuImportUseCase } from './retry-menu-import.use-case.js';
import { addProcessMenuImportJob } from '../../../../../infrastructure/queue/queues/menu-import.queue.js';
import { MenuDomainError } from '../../../domain/errors/menu-domain.error.js';
import { MenuImportStatus } from '../../../domain/entities/menu-import.entity.js';
import { RestaurantTokens } from '../../../../restaurant/infrastructure/persistence/tokens/restaurant.tokens.js';
import type { IRestaurantRepository } from '../../../../restaurant/domain/repositories/restaurant.repository.js';

@injectable()
export class RetryMenuImportUseCaseImpl implements RetryMenuImportUseCase {
  constructor(
    @inject(MenuTokens.MenuImportRepository)
    private readonly menuImportRepository: MenuImportRepository,
    @inject(RestaurantTokens.RestaurantRepository)
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  async execute(input: RetryMenuImportInput): Promise<void> {
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

    if (importEntity.getStatus() !== MenuImportStatus.FAILED) {
      throw new MenuDomainError('Only failed imports can be retried');
    }

    importEntity.retry();
    await this.menuImportRepository.save(importEntity);

    // Enqueue job for reprocessing
    await addProcessMenuImportJob({ importId: importEntity.getId() });
  }
}
