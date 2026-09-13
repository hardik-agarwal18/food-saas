export interface RetryMenuImportInput {
  importId: string;
  restaurantId: string;
  actorId: string;
}

export interface RetryMenuImportUseCase {
  execute(input: RetryMenuImportInput): Promise<void>;
}
