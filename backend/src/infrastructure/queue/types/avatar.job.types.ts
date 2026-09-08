export enum AvatarJobName {
  UPLOAD_AVATAR = 'upload-avatar',
}

export interface UploadAvatarJobData {
  userId: string;
  tempObjectKey: string;
  originalName: string;
  mimeType: string;
}
