export interface RawMenuDocument {
  text: string;
  metadata?: any;
}

export interface MenuDocument {
  buffer: Buffer;
  mimeType: string;
}

export interface MenuDocumentReader {
  /**
   * Extracts raw text from a document image or PDF
   */
  extract(document: MenuDocument): Promise<RawMenuDocument>;
}
