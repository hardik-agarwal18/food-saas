export interface CreateMenuImportInput {
  restaurantId: string;
  mimeType: string;
  buffer: Buffer;
  contentLength: number;
}

export interface CreateMenuImportOutput {
  id: string;
  status: string;
}

export interface CreateMenuImportUseCase {
  execute(input: CreateMenuImportInput): Promise<CreateMenuImportOutput>;
}
