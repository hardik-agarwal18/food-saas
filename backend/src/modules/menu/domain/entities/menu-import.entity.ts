import { MenuDomainError } from '../errors/menu-domain.error.js';

export enum MenuImportStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  READY_FOR_REVIEW = 'READY_FOR_REVIEW',
  CONFIRMED = 'CONFIRMED',
  IMPORTED = 'IMPORTED',
  FAILED = 'FAILED',
}

export type MenuImportProps = {
  id: string;
  restaurantId: string;
  status: MenuImportStatus;
  sourceFileKey: string;
  mimeType: string;
  rawOcrText: string | null;
  extractedData: any | null; // Typed loosely as any here for domain, could refine later
  warnings: any | null;
  errors: any | null;
  failureReason: string | null;
  retryCount: number;
  processingAt: Date | null;
  reviewedAt: Date | null;
  confirmedAt: Date | null;
  importedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export class MenuImport {
  private readonly id: string;
  private readonly restaurantId: string;
  private status: MenuImportStatus;
  private readonly sourceFileKey: string;
  private readonly mimeType: string;
  private rawOcrText: string | null;
  private extractedData: any | null;
  private warnings: any | null;
  private errors: any | null;
  private failureReason: string | null;
  private retryCount: number;
  private processingAt: Date | null;
  private reviewedAt: Date | null;
  private confirmedAt: Date | null;
  private importedAt: Date | null;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private readonly version: number;

  constructor(props: MenuImportProps) {
    this.id = MenuImport.validateId(props.id);
    this.restaurantId = MenuImport.validateId(props.restaurantId);
    this.status = props.status;
    this.sourceFileKey = props.sourceFileKey;
    this.mimeType = props.mimeType;
    this.rawOcrText = props.rawOcrText;
    this.extractedData = props.extractedData;
    this.warnings = props.warnings;
    this.errors = props.errors;
    this.failureReason = props.failureReason;
    this.retryCount = props.retryCount;
    this.processingAt = props.processingAt;
    this.reviewedAt = props.reviewedAt;
    this.confirmedAt = props.confirmedAt;
    this.importedAt = props.importedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.version = props.version;
  }

  public static create(params: {
    restaurantId: string;
    sourceFileKey: string;
    mimeType: string;
  }): MenuImport {
    const now = new Date();
    return new MenuImport({
      id: crypto.randomUUID(),
      restaurantId: params.restaurantId,
      status: MenuImportStatus.UPLOADED,
      sourceFileKey: params.sourceFileKey,
      mimeType: params.mimeType,
      rawOcrText: null,
      extractedData: null,
      warnings: null,
      errors: null,
      failureReason: null,
      retryCount: 0,
      processingAt: null,
      reviewedAt: null,
      confirmedAt: null,
      importedAt: null,
      createdAt: now,
      updatedAt: now,
      version: 0,
    });
  }

  public static rehydrate(props: MenuImportProps): MenuImport {
    return new MenuImport(props);
  }

  // Getters
  public getId(): string {
    return this.id;
  }
  public getRestaurantId(): string {
    return this.restaurantId;
  }
  public getStatus(): MenuImportStatus {
    return this.status;
  }
  public getSourceFileKey(): string {
    return this.sourceFileKey;
  }
  public getMimeType(): string {
    return this.mimeType;
  }
  public getRawOcrText(): string | null {
    return this.rawOcrText;
  }
  public getExtractedData(): any | null {
    return this.extractedData;
  }
  public getWarnings(): any | null {
    return this.warnings;
  }
  public getErrors(): any | null {
    return this.errors;
  }
  public getFailureReason(): string | null {
    return this.failureReason;
  }
  public getRetryCount(): number {
    return this.retryCount;
  }
  public getProcessingAt(): Date | null {
    return this.processingAt;
  }
  public getReviewedAt(): Date | null {
    return this.reviewedAt;
  }
  public getConfirmedAt(): Date | null {
    return this.confirmedAt;
  }
  public getImportedAt(): Date | null {
    return this.importedAt;
  }
  public getCreatedAt(): Date {
    return this.createdAt;
  }
  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
  public getVersion(): number {
    return this.version;
  }

  // State transitions

  public startProcessing(staleThresholdMs = 5 * 60 * 1000): void {
    if (this.status === MenuImportStatus.PROCESSING) {
      const isStale =
        this.processingAt && new Date().getTime() - this.processingAt.getTime() > staleThresholdMs;
      if (!isStale) {
        throw new MenuDomainError(`Cannot start processing, currently processing and not stale`);
      }
    } else if (
      this.status !== MenuImportStatus.UPLOADED &&
      this.status !== MenuImportStatus.FAILED
    ) {
      throw new MenuDomainError(`Cannot start processing from state ${this.status}`);
    }
    this.status = MenuImportStatus.PROCESSING;
    this.processingAt = new Date();
    this.failureReason = null;
    this.touch();
  }

  public markReadyForReview(params: {
    rawOcrText: string;
    extractedData: any;
    warnings: any;
    errors: any;
  }): void {
    if (this.status !== MenuImportStatus.PROCESSING) {
      throw new MenuDomainError(`Cannot mark ready for review from state ${this.status}`);
    }
    this.status = MenuImportStatus.READY_FOR_REVIEW;
    this.rawOcrText = params.rawOcrText;
    this.extractedData = params.extractedData;
    this.warnings = params.warnings;
    this.errors = params.errors;
    this.reviewedAt = new Date();
    this.touch();
  }

  public fail(reason: string): void {
    this.status = MenuImportStatus.FAILED;
    this.failureReason = reason;
    this.touch();
  }

  public retry(): void {
    if (this.status !== MenuImportStatus.FAILED) {
      throw new MenuDomainError(`Cannot retry from state ${this.status}`);
    }
    this.status = MenuImportStatus.UPLOADED;
    this.retryCount += 1;
    this.touch();
  }

  public confirm(): void {
    if (this.status !== MenuImportStatus.READY_FOR_REVIEW) {
      throw new MenuDomainError(`Cannot confirm from state ${this.status}`);
    }
    this.status = MenuImportStatus.CONFIRMED;
    this.confirmedAt = new Date();
    this.touch();
  }

  public editExtraction(extractedData: any): void {
    if (this.status !== MenuImportStatus.READY_FOR_REVIEW) {
      throw new MenuDomainError(`Cannot edit extraction from state ${this.status}`);
    }
    this.extractedData = extractedData;
    this.touch();
  }

  public markImported(): void {
    if (this.status !== MenuImportStatus.CONFIRMED) {
      throw new MenuDomainError(`Cannot mark imported from state ${this.status}`);
    }
    this.status = MenuImportStatus.IMPORTED;
    this.importedAt = new Date();
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  private static validateId(id: string): string {
    if (!id || id.trim().length === 0) throw new MenuDomainError('Invalid ID');
    return id.trim();
  }
}
