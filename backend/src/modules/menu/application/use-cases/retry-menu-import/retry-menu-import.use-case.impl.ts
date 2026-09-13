import { inject, injectable } from 'tsyringe';
import { MenuTokens } from '../../../infrastructure/persistence/tokens/menu.tokens.js';
import type { MenuImportRepository } from '../../../domain/repositories/menu-import.repository.js';
import type { RetryMenuImportInput, RetryMenuImportUseCase } from './retry-menu-import.use-case.js';
import { addProcessMenuImportJob } from '../../../../../infrastructure/queue/queues/menu-import.queue.js';
import { MenuDomainError } from '../../../domain/errors/menu-domain.error.js';
import { MenuImportStatus } from '../../../domain/entities/menu-import.entity.js';

@injectable()
export class RetryMenuImportUseCaseImpl implements RetryMenuImportUseCase {
  constructor(
    @inject(MenuTokens.MenuImportRepository)
    private readonly menuImportRepository: MenuImportRepository,
  ) {}

  async execute(input: RetryMenuImportInput): Promise<void> {
    const importEntity = await this.menuImportRepository.findByIdForUpdate(input.importId);

    if (!importEntity) {
      throw new MenuDomainError('Menu import not found');
    }

    if (importEntity.getRestaurantId() !== input.restaurantId) {
      throw new MenuDomainError('Unauthorized access to menu import');
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
