import { inject, injectable } from 'tsyringe';
import { MenuTokens } from '../../../infrastructure/persistence/tokens/menu.tokens.js';
import { InfrastructureTokens } from '../../../../../infrastructure/container/tokens/index.js';
import type { FileStorage } from '../../../../../shared/contracts/storage/file-storage.js';
import type { MenuImportRepository } from '../../../domain/repositories/menu-import.repository.js';
import { MenuImport } from '../../../domain/entities/menu-import.entity.js';
import { addProcessMenuImportJob } from '../../../../../infrastructure/queue/queues/menu-import.queue.js';
import type {
  CreateMenuImportInput,
  CreateMenuImportOutput,
  CreateMenuImportUseCase,
} from './create-menu-import.use-case.js';
import { EventDispatcher } from '../../../../../shared/events/event-dispatcher.js';
import { MenuImportCreatedEvent } from '../../../domain/events/menu-import.events.js';

@injectable()
export class CreateMenuImportUseCaseImpl implements CreateMenuImportUseCase {
  constructor(
    @inject(MenuTokens.MenuImportRepository)
    private readonly menuImportRepository: MenuImportRepository,
    @inject(InfrastructureTokens.FileStorage)
    private readonly fileStorage: FileStorage,
  ) {}

  async execute(input: CreateMenuImportInput): Promise<CreateMenuImportOutput> {
    // We could construct the MenuImport directly with this ID
    // but the create method currently generates one. We'll bypass `create` to inject the ID
    // or just use `create` and get the ID.
    // Let's use `create` and we'll use its generated ID.

    const sourceFileKey = `restaurants/${input.restaurantId}/menu-imports/${crypto.randomUUID()}/source`;

    const menuImport = MenuImport.create({
      restaurantId: input.restaurantId,
      sourceFileKey,
      mimeType: input.mimeType,
    });

    // 1. Create import record (initially UPLOADED state)
    await this.menuImportRepository.create(menuImport);

    // 2. Upload document to R2
    try {
      await this.fileStorage.upload({
        key: sourceFileKey,
        body: input.buffer,
        contentType: input.mimeType,
        contentLength: input.contentLength,
      });
    } catch (uploadError) {
      // If R2 upload fails, mark import as failed
      menuImport.fail('Failed to upload document to storage');
      await this.menuImportRepository.save(menuImport);
      throw uploadError;
    }

    // 3. Enqueue job
    try {
      await addProcessMenuImportJob({ importId: menuImport.getId() });

      // Dispatch domain event (could be picked up by Outbox if configured)
      EventDispatcher.getInstance().dispatch(
        new MenuImportCreatedEvent(menuImport.getId(), menuImport.getRestaurantId(), sourceFileKey),
      );
    } catch (queueError) {
      // If enqueue fails, mark import as failed so it can be retried later
      menuImport.fail('Failed to enqueue processing job');
      await this.menuImportRepository.save(menuImport);
      throw queueError;
    }

    return {
      id: menuImport.getId(),
      status: menuImport.getStatus(),
    };
  }
}
