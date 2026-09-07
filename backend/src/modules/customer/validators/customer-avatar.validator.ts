import { BadRequestError } from '../../../shared/errors/BadRequestError.js';
import { fileTypeFromBuffer } from 'file-type';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface CustomerAvatarFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

export async function validateCustomerAvatar(file: CustomerAvatarFile): Promise<void> {
  if (!file) {
    throw new BadRequestError('Avatar file cannot be empty');
  }

  if (file.size <= 0) {
    throw new BadRequestError('Avatar file cannot be empty');
  }

  if (file.size > MAX_AVATAR_SIZE) {
    throw new BadRequestError('Avatar file cannot exceed 5 MB');
  }

  const extension = getFileExtension(file.originalname);

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new BadRequestError('Only JPG, JPEG, PNG and WEBP files are allowed');
  }

  const type = await fileTypeFromBuffer(file.buffer);

  if (!type || !ALLOWED_MIME_TYPES.has(type.mime)) {
    throw new BadRequestError(
      'Invalid file type detected. Only JPG, PNG, and WEBP images are allowed',
    );
  }
}

function getFileExtension(filename: string): string {
  const index = filename.lastIndexOf('.');

  if (index === -1) {
    return '';
  }

  return filename.slice(index).toLowerCase();
}
