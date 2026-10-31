import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config/env';
import logger from '../utils/logger';

interface SentEmailRecord {
  to: string;
  subject: string;
  resetLink: string;
  token: string;
  sentAt: Date;
}

export class EmailService {
  private transporter: Transporter | null = null;
  public lastSentEmail: SentEmailRecord | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_PORT === 465,
        auth: {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS,
        },
      });
    } catch (err) {
      logger.warn('SMTP Transporter initialization deferred:', err);
    }
  }

  /**
   * Dispatches a password reset email to the specified user.
   */
  public async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    name?: string
  ): Promise<void> {
    const resetUrl = `${config.CLIENT_URL}/reset-password?token=${resetToken}`;

    // Record for testing and audit
    this.lastSentEmail = {
      to,
      subject: 'Password Reset Request — SubScribePro',
      resetLink: resetUrl,
      token: resetToken,
      sentAt: new Date(),
    };

    const recipientName = name || 'Customer';
    const textContent = `Hello ${recipientName},\n\nYou requested a password reset for your account. Please click the link below to set a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour. If you did not make this request, you can safely ignore this email.\n\nBest regards,\nSubScribePro Team`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px;">
        <h2 style="color: #4f46e5; margin-bottom: 16px;">SubScribePro Password Reset</h2>
        <p>Hello <strong>${recipientName}</strong>,</p>
        <p>We received a request to reset the password for your SubScribePro account. Click the button below to choose a new password:</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 13px; color: #64748b;">Or copy and paste this link in your browser:<br/><a href="${resetUrl}" style="color: #4f46e5;">${resetUrl}</a></p>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
      </div>
    `;

    try {
      if (this.transporter && config.SMTP_USER && config.SMTP_PASS) {
        await this.transporter.sendMail({
          from: `"SubScribePro" <${config.EMAIL_FROM}>`,
          to,
          subject: 'Password Reset Request — SubScribePro',
          text: textContent,
          html: htmlContent,
        });
        logger.info(`Password reset email sent to: ${to}`);
      } else {
        // Fallback for development/testing without real SMTP credentials
        logger.info(`[Email Service Simulation] Password reset link for ${to}: ${resetUrl}`);
      }
    } catch (error) {
      logger.error(`Failed to send password reset email to ${to}:`, error);
      // We log but do not bubble raw SMTP errors to the client to avoid leaking email information
    }
  }
}

export const emailService = new EmailService();

