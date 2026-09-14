export interface CreateMenuImportInput {
  restaurantId: string;
  actorId: string;
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
