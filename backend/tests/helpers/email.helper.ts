import { EmailService } from '../../src/infrastructure/email/email.service.js';

export class MockEmailService implements EmailService {
  public verificationEmails: { email: string; url: string }[] = [];
  public resetPasswordEmails: { email: string; url: string }[] = [];

  async sendVerificationEmail(email: string, verificationUrl: string): Promise<void> {
    this.verificationEmails.push({ email, url: verificationUrl });
  }

  async sendResetPasswordEmail(email: string, resetPasswordUrl: string): Promise<void> {
    this.resetPasswordEmails.push({ email, url: resetPasswordUrl });
  }

  clear() {
    this.verificationEmails = [];
    this.resetPasswordEmails = [];
  }
}
