import { injectable } from 'tsyringe';
import { GoogleGenAI } from '@google/genai';
import type {
  MenuDocument,
  MenuDocumentReader,
  RawMenuDocument,
} from '../../application/contracts/menu-document-reader.interface.js';
import { env } from '../../../../config/env.config.js';
import { GEMINI_MENU_MODEL } from './gemini.constants.js';

@injectable()
export class GeminiMenuDocumentReader implements MenuDocumentReader {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  async extract(document: MenuDocument): Promise<RawMenuDocument> {
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
              inlineData: {
                data: document.buffer.toString('base64'),
                mimeType: document.mimeType,
              },
            },
            {
              text: 'You are an expert OCR AI. Please extract and transcribe all the text from this restaurant menu document exactly as written. Ensure you capture all categories, items, prices, and descriptions accurately.',
            },
          ],
        },
      ],
    });

    const text = response.text;
    if (!text) {
      throw new Error('Failed to extract text from document using Gemini');
    }

    return {
      text,
      metadata: {
        source: GEMINI_MENU_MODEL,
      },
    };
  }
}
