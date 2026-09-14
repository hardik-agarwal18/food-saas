export enum ImageJobName {
  PROCESS_IMAGE = 'process-image',
}

export type ImagePurpose =
  'USER_AVATAR' | 'RESTAURANT_LOGO' | 'RESTAURANT_COVER' | 'MENU_ITEM' | 'MENU_CATEGORY';

export type ImageVariantName = 'original' | 'thumbnail' | 'small' | 'medium' | 'large';

export interface ImageProcessingJobData {
  mediaId: string;
  sourceKey: string;
  purpose: ImagePurpose;
  entityId: string;
  mimeType: string;
  requestedVariants?: ImageVariantName[];
}
