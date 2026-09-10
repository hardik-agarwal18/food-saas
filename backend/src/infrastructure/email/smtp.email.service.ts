import { injectable } from 'tsyringe';
import nodemailer, { Transporter } from 'nodemailer';
import { EmailService } from './email.service.js';
import { smtpConfig, smtpOptions } from '../../config/smtp.config.js';
import { env } from '../../config/env.config.js';

@injectable()
export class SmtpService implements EmailService {
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(smtpOptions);
  }

  async sendVerificationEmail(email: string, verificationUrl: string): Promise<void> {
    await this.transporter.sendMail({
      from: smtpConfig.from,
      to: email,
      subject: '[ACTION REQUIRED] Please Verify Your Email',
      text: `Verify you FoodFlow account by clicking on this link: ${verificationUrl}`,
      html: `
      <div>
                <h1>Welcome to FoodFlow</h1>

                <p>
                  Thanks for creating your FoodFlow account.
                </p>

                <p>
                  Please verify your email address by clicking the button below.
                </p>

                <a
                  href="${verificationUrl}"
                  style="
                    display:inline-block;
                    padding:12px 20px;
                    background:#000;
                    color:#fff;
                    text-decoration:none;
                    border-radius:6px;
                  "
                >
                  Verify Email
                </a>

                <p>
                  This verification link will expire soon.
                </p>
              </div>
      `,
    });
  }

  async sendResetPasswordEmail(email: string, resetPasswordUrl: string): Promise<void> {
    await this.transporter.sendMail({
      from: smtpConfig.from,
      to: email,
      subject: '[ACTION_REQUIRED] FoodFlow - Password Reset Link',
      text: `Reset your FoodFlow password by clicking on this link: ${resetPasswordUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h1>Reset your FoodFlow password</h1>
          <p>
            We received a request to reset your FoodFlow password.
          </p>
          <p>
            Click the button below to choose a new password.
          </p>
          <p>
            <a
              href="${resetPasswordUrl}"
              style="
                display: inline-block;
                padding: 12px 20px;
                background: #000;
                color: #fff;
                text-decoration: none;
                border-radius: 6px;
              "
            >
              Reset Password
            </a>
          </p>
          <p>
            This link will expire in ${env.RESET_PASSWORD_TOKEN_EXPIRY} minutes.
          </p>
          <p>
            If you did not request a password reset,
            you can safely ignore this email.
          </p>
        </div>
      `,
    });
  }

  async sendOrderReadyEmail(email: string, orderId: string, restaurantName: string): Promise<void> {
    await this.transporter.sendMail({
      from: smtpConfig.from,
      to: email,
      subject: `FoodFlow - Your order from ${restaurantName} is Ready!`,
      text: `Good news! Your order #${orderId.substring(0, 8)} from ${restaurantName} is ready for pickup or delivery.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Your order is ready! 🍔</h2>
          <p>Your order <strong>#${orderId.substring(0, 8)}</strong> from <strong>${restaurantName}</strong> is prepared and ready to go.</p>
          <p>Thank you for using FoodFlow.</p>
        </div>
      `,
    });
  }

  async sendOrderPickedUpEmail(email: string, orderId: string, driverName: string): Promise<void> {
    await this.transporter.sendMail({
      from: smtpConfig.from,
      to: email,
      subject: `FoodFlow - Your order is on the way!`,
      text: `Your driver, ${driverName}, has picked up your order #${orderId.substring(0, 8)} and is heading your way.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Out for delivery 🚗</h2>
          <p>Your order <strong>#${orderId.substring(0, 8)}</strong> has been picked up by your driver, <strong>${driverName}</strong>.</p>
          <p>They are currently en route to your location.</p>
        </div>
      `,
    });
  }

  async sendOrderDeliveredEmail(email: string, orderId: string): Promise<void> {
    await this.transporter.sendMail({
      from: smtpConfig.from,
      to: email,
      subject: `FoodFlow - Order Delivered!`,
      text: `Your order #${orderId.substring(0, 8)} has been delivered. Enjoy your meal!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Enjoy your meal! 🍽️</h2>
          <p>Your order <strong>#${orderId.substring(0, 8)}</strong> has been successfully delivered.</p>
          <p>Thank you for choosing FoodFlow!</p>
        </div>
      `,
    });
  }
}
