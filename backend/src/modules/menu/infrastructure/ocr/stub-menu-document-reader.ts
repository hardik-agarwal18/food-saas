import { injectable } from 'tsyringe';
import {
  MenuDocument,
  MenuDocumentReader,
  RawMenuDocument,
} from '../../application/contracts/menu-document-reader.interface.js';

@injectable()
export class StubMenuDocumentReader implements MenuDocumentReader {
  public async extract(document: MenuDocument): Promise<RawMenuDocument> {
    // Simulate OCR processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Return a dummy raw OCR text string
    const text = `
Starters
Paneer Tikka
Charcoal grilled cottage cheese
₹250

Samosa
Crispy pastry filled with spiced potatoes
₹100

Main Course
Butter Chicken
Creamy tomato curry with tandoori chicken
₹450
`;

    return {
      text: text.trim(),
    };
  }
}
