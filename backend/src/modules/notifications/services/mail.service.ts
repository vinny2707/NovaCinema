import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly mailFrom: string;
  private readonly mailFromName: string;
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;

  constructor(private readonly config: ConfigService) {
    this.mailFrom = this.config.getOrThrow('MAIL_FROM');
    this.mailFromName = this.config.get('MAIL_FROM_NAME') ?? 'NovaCinema';

    this.resend = new Resend(this.config.getOrThrow('RESEND_API_KEY'));
  }

  async send(options: SendMailOptions) {
    const {
      html,
      subject,
      to: mailTo,
      text = `${this.mailFromName} - ${subject}`,
    } = options;

    try {
      const response = await this.resend.emails.send({
        to: mailTo,
        from: `${this.mailFromName} <${this.mailFrom}>`,
        subject,
        html,
        text,
      });

      this.logger.log('[MAIL] Sent OK', response);
      return true;
    } catch (err) {
      this.logger.error('[MAIL] Send FAILED');
      this.logger.error(err);
      throw err;
    }
  }
}
