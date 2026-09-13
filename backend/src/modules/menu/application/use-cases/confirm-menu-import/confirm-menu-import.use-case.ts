export interface ConfirmMenuImportInput {
  importId: string;
  restaurantId: string;
  editedData?: any; // Allow the user to submit edits before confirmation
}

export interface ConfirmMenuImportUseCase {
  execute(input: ConfirmMenuImportInput): Promise<void>;
}
