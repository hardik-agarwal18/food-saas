import { injectable } from 'tsyringe';
import { ExtractedMenu, MenuParser } from '../../application/contracts/menu-parser.interface.js';
import { RawMenuDocument } from '../../application/contracts/menu-document-reader.interface.js';

@injectable()
export class DefaultMenuParser implements MenuParser {
  public async parse(input: RawMenuDocument): Promise<ExtractedMenu> {
    // In a real implementation, this would use regex, NLP, or an LLM
    // to structure the raw text into categories and items.

    // For this stub, we'll return a hardcoded structured menu
    // that roughly matches the stub OCR text.

    return {
      data: {
        categories: [
          {
            name: 'Starters',
            items: [
              {
                name: 'Paneer Tikka',
                description: 'Charcoal grilled cottage cheese',
                price: 250,
              },
              {
                name: 'Samosa',
                description: 'Crispy pastry filled with spiced potatoes',
                price: 100,
              },
            ],
          },
          {
            name: 'Main Course',
            items: [
              {
                name: 'Butter Chicken',
                description: 'Creamy tomato curry with tandoori chicken',
                price: 450,
              },
            ],
          },
        ],
      },
      warnings: [],
      errors: [],
    };
  }
}
