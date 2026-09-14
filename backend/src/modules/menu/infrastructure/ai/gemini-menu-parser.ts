import { injectable } from 'tsyringe';
import { GoogleGenAI, Type } from '@google/genai';
import type {
  ExtractedMenu,
  MenuParser,
} from '../../application/contracts/menu-parser.interface.js';
import type { RawMenuDocument } from '../../application/contracts/menu-document-reader.interface.js';
import { env } from '../../../../config/env.config.js';
import { GEMINI_MENU_MODEL } from './gemini.constants.js';
import { extractedMenuDataSchema } from '../../shared/schemas/extracted-menu.schema.js';

@injectable()
export class GeminiMenuParser implements MenuParser {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  async parse(input: RawMenuDocument): Promise<ExtractedMenu> {
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const response = await this.ai.models.generateContent({
      model: GEMINI_MENU_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are an expert at structuring restaurant menus. Parse the following OCR text into the provided JSON schema. Ensure prices are numeric (e.g. 10.50). Handle any potential inconsistencies gracefully.\n\n${input.text}`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: 'The name of the category (e.g., Starters, Mains, Desserts)',
                  },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: {
                          type: Type.STRING,
                          description: 'The name of the menu item',
                        },
                        description: {
                          type: Type.STRING,
                          description: 'The description of the menu item. Can be empty.',
                        },
                        price: {
                          type: Type.NUMBER,
                          description: 'The price of the item as a number (e.g. 12.99)',
                        },
                      },
                      required: ['name', 'price'],
                    },
                  },
                },
                required: ['name', 'items'],
              },
            },
          },
          required: ['categories'],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error('Failed to generate structured data from Gemini');
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(jsonText);
    } catch (e) {
      throw new Error('Gemini output was not valid JSON');
    }

    let validatedData: any;
    try {
      validatedData = extractedMenuDataSchema.parse(parsedData);
    } catch (e: any) {
      throw new Error(`Gemini output failed validation: ${e.message}`);
    }

    return {
      data: {
        categories: validatedData.categories || [],
      },
      warnings: [],
      errors: [],
    };
  }
}
