import { BadRequestException, Injectable } from '@nestjs/common';
import { HashUtil } from 'src/common/utils';
import { OtpRepository } from '../repositories/otp.repository';
import { MailService } from './mail.service';
import { TemplateRenderService } from './template-render.service';

@Injectable()
export class OtpService {
  private readonly OTP_LENGTH = 6;
  private readonly OTP_TTL_MS = 5 * 60 * 1000;

  constructor(
    private readonly otpRepo: OtpRepository,
    private readonly mailService: MailService,
    private readonly templateRender: TemplateRenderService,
  ) {}

  public async send(email: string): Promise<void> {
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + this.OTP_TTL_MS);
    const otpHash = await HashUtil.hash(otp);

    await this.otpRepo.upsertOtp(email, otpHash, expiresAt);

    const html = this.templateRender.render('verify-email', {
      otp,
    });
    const text = `Your NovaCinema verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;

    await this.mailService.send({
      to: email,
      subject: 'Verify your email',
      html,
      text,
    });
  }

  public async verify(email: string, otp: string): Promise<void> {
    const record = await this.otpRepo.findValidOtp(email);
    if (!record) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const isMatch = await HashUtil.compare(otp, record.otpHash);
    if (!isMatch) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.otpRepo.deleteByEmail(email);
  }

  private generateOtp(): string {
    return Array.from({ length: this.OTP_LENGTH }, () =>
      Math.floor(Math.random() * 10),
    ).join('');
  }
}
