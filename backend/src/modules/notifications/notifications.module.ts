import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './schemas';
import { OtpRepository } from './repositories';
import {
  MailService,
  NotificationService,
  OtpService,
  TemplateRenderService,
} from './services';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
  ],
  providers: [
    TemplateRenderService,
    MailService,
    OtpRepository,
    OtpService,
    NotificationService,
  ],
  exports: [MailService, OtpService, NotificationService],
})
export class NotificationsModule {}
