export const EmailJobName = {
  SEND_VERIFICATION_EMAIL: 'send-verification-email',
  SEND_RESET_PASSWORD_EMAIL: 'send-reset-password-email',
} as const;

export type EmailJobName = (typeof EmailJobName)[keyof typeof EmailJobName];

export interface BaseEmailJob {
  correlationId?: string;
}

export interface SendVerificationEmailJob extends BaseEmailJob {
  userId: string;
  email: string;
  verificationUrl: string;
}

export interface SendResetPasswordEmailJob extends BaseEmailJob {
  userId: string;
  email: string;
  resetPasswordUrl: string;
}
