export interface ConfirmMenuImportInput {
  importId: string;
  restaurantId: string;
  actorId: string;
  editedData?: any; // Allow the user to submit edits before confirmation
}

export interface ConfirmMenuImportUseCase {
  execute(input: ConfirmMenuImportInput): Promise<void>;
}
