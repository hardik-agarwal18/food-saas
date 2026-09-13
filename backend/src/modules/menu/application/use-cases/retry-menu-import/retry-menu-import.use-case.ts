export interface RetryMenuImportInput {
  importId: string;
  restaurantId: string;
}

export interface RetryMenuImportUseCase {
  execute(input: RetryMenuImportInput): Promise<void>;
}
