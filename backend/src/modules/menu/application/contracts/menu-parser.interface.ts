import { RawMenuDocument } from './menu-document-reader.interface.js';

export interface ExtractedMenuItem {
  name: string;
  description?: string;
  price: number;
}

export interface ExtractedMenuCategory {
  name: string;
  items: ExtractedMenuItem[];
}

export interface ExtractedMenu {
  data: {
    categories: ExtractedMenuCategory[];
  };
  warnings: string[];
  errors: string[];
}

export interface MenuParser {
  /**
   * Parses raw OCR text into a structured menu format
   */
  parse(input: RawMenuDocument): Promise<ExtractedMenu>;
}
