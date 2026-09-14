import {
  Prisma,
  MenuImportStatus as PrismaMenuImportStatus,
} from '../../../../../../generated/prisma/client.js';
import { MenuImport, MenuImportStatus } from '../../../../domain/entities/menu-import.entity.js';

export class MenuImportMapper {
  public static toDomain(raw: Prisma.MenuImportGetPayload<{}>): MenuImport {
    return MenuImport.rehydrate({
      id: raw.id,
      restaurantId: raw.restaurantId,
      status: raw.status as MenuImportStatus,
      sourceFileKey: raw.sourceFileKey,
      mimeType: raw.mimeType,
      rawOcrText: raw.rawOcrText,
      extractedData: raw.extractedData,
      warnings: raw.warnings,
      errors: raw.errors,
      failureReason: raw.failureReason,
      retryCount: raw.retryCount,
      processingAt: raw.processingAt,
      reviewedAt: raw.reviewedAt,
      confirmedAt: raw.confirmedAt,
      importedAt: raw.importedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      version: raw.version,
    });
  }

  public static toPersistence(entity: MenuImport): any {
    return {
      id: entity.getId(),
      restaurantId: entity.getRestaurantId(),
      status: entity.getStatus() as PrismaMenuImportStatus,
      sourceFileKey: entity.getSourceFileKey(),
      mimeType: entity.getMimeType(),
      rawOcrText: entity.getRawOcrText(),
      extractedData: entity.getExtractedData() ?? undefined,
      warnings: entity.getWarnings() ?? undefined,
      errors: entity.getErrors() ?? undefined,
      failureReason: entity.getFailureReason(),
      retryCount: entity.getRetryCount(),
      processingAt: entity.getProcessingAt(),
      reviewedAt: entity.getReviewedAt(),
      confirmedAt: entity.getConfirmedAt(),
      importedAt: entity.getImportedAt(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
      version: entity.getVersion(),
    };
  }
}
