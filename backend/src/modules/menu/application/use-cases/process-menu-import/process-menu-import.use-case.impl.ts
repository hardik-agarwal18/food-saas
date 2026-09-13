import { inject, injectable } from 'tsyringe';
import { MenuTokens } from '../../../infrastructure/tokens/menu.tokens.js';
import { InfrastructureTokens } from '../../../../../infrastructure/container/tokens/index.js';
import type { MenuImportRepository } from '../../../domain/repositories/menu-import.repository.js';
import type { MenuDocumentReader } from '../../contracts/menu-document-reader.interface.js';
import type { MenuParser } from '../../contracts/menu-parser.interface.js';
import type {
  ProcessMenuImportInput,
  ProcessMenuImportUseCase,
} from './process-menu-import.use-case.js';
import { MenuImportStatus } from '../../../domain/entities/menu-import.entity.js';
import { EventDispatcher } from '../../../../../shared/events/event-dispatcher.js';
import {
  MenuImportFailedEvent,
  MenuImportProcessingStartedEvent,
  MenuImportReadyForReviewEvent,
} from '../../../domain/events/menu-import.events.js';
import type { ILogger } from '../../../../../shared/logger/logger.interface.js';

@injectable()
export class ProcessMenuImportUseCaseImpl implements ProcessMenuImportUseCase {
  constructor(
    @inject(MenuTokens.MenuImportRepository)
    private readonly menuImportRepository: MenuImportRepository,
    @inject(MenuTokens.MenuDocumentReader)
    private readonly documentReader: MenuDocumentReader,
    @inject(MenuTokens.MenuParser)
    private readonly menuParser: MenuParser,
    @inject(InfrastructureTokens.Logger)
    private readonly logger: ILogger,
  ) {}

  async execute(input: ProcessMenuImportInput): Promise<void> {
    const importEntity = await this.menuImportRepository.findByIdForUpdate(input.importId);
    if (!importEntity) {
      this.logger.error(`Menu import not found for ID: ${input.importId}`);
      return;
    }

    // Idempotency checks
    if (
      importEntity.getStatus() === MenuImportStatus.READY_FOR_REVIEW ||
      importEntity.getStatus() === MenuImportStatus.CONFIRMED ||
      importEntity.getStatus() === MenuImportStatus.IMPORTED
    ) {
      this.logger.info(
        `Menu import ${input.importId} is already processed. Current status: ${importEntity.getStatus()}`,
      );
      return;
    }

    try {
      importEntity.startProcessing();
      await this.menuImportRepository.save(importEntity);
      EventDispatcher.getInstance().dispatch(
        new MenuImportProcessingStartedEvent(importEntity.getId(), importEntity.getRestaurantId()),
      );
    } catch (e: any) {
      if (e.message.includes('currently processing and not stale')) {
        this.logger.info(
          `Menu import ${input.importId} is currently processing and not stale. Skipping.`,
        );
        return;
      }
      this.logger.error(`Failed to transition menu import ${input.importId} to processing:`, e);
      return; // Could be optimistic lock error, let it be retried by BullMQ
    }

    try {
      // 1. Download file
      // In a real implementation, we might fetch the file buffer.
      // const url = this.fileStorage.getUrl(importEntity.getSourceFileKey());
      // const response = await fetch(url);
      // const buffer = Buffer.from(await response.arrayBuffer());
      const buffer = Buffer.from(''); // Stub buffer

      // 2. OCR Extraction
      const rawDocument = await this.documentReader.extract({
        buffer,
        mimeType: importEntity.getMimeType(),
      });

      // 3. Parser
      const extractedMenu = await this.menuParser.parse(rawDocument);

      // 4. Update status to READY_FOR_REVIEW
      importEntity.markReadyForReview({
        rawOcrText: rawDocument.text,
        extractedData: extractedMenu.data,
        warnings: extractedMenu.warnings,
        errors: extractedMenu.errors,
      });

      await this.menuImportRepository.save(importEntity);
      EventDispatcher.getInstance().dispatch(
        new MenuImportReadyForReviewEvent(importEntity.getId(), importEntity.getRestaurantId()),
      );
    } catch (error: any) {
      this.logger.error(`Error processing menu import ${input.importId}:`, error);
      importEntity.fail(error?.message || 'Unknown error during processing');
      await this.menuImportRepository.save(importEntity);
      EventDispatcher.getInstance().dispatch(
        new MenuImportFailedEvent(
          importEntity.getId(),
          importEntity.getRestaurantId(),
          error?.message,
        ),
      );
      throw error; // Let BullMQ retry according to its policy
    }
  }
}
