export interface ProcessMenuImportInput {
  importId: string;
}

export interface ProcessMenuImportUseCase {
  execute(input: ProcessMenuImportInput): Promise<void>;
}
