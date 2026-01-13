import { Injectable } from '@nestjs/common';
import { MailService } from './mail.service';
import { TemplateRenderService } from './template-render.service';

export interface PaymentNotificationInput {
  amount: number;
  transactionId?: string;
  transactionAt?: Date;
}

export interface BookingNotificationInput {
  movieTitle?: string;
  theaterName?: string;
  roomName?: string;
  roomType: string;
  startAt: Date;
}

export interface TicketNotificationInput {
  code: string;
  seatCode: string;
  seatType: string;
  unitPrice: number;
}

export interface SendPaymentSuccessEmailOptions {
  to: string;
  payment: PaymentNotificationInput;
  booking: BookingNotificationInput;
  tickets: TicketNotificationInput[];
  frontendUrl?: string;
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly mailService: MailService,
    private readonly templateService: TemplateRenderService,
  ) {}

  public async sendPaymentSuccessEmail(
    options: SendPaymentSuccessEmailOptions,
  ) {
    const { to, payment, booking, tickets, frontendUrl } = options;

    const html = this.templateService.render('payment-success', {
      amount: payment.amount.toLocaleString('vi-VN'),
      transactionId: payment.transactionId,
      transactionAt: payment.transactionAt?.toLocaleString('vi-VN'),
      movieTitle: booking.movieTitle,
      theaterName: booking.theaterName,
      roomName: booking.roomName,
      roomType: booking.roomType,
      startAt: booking.startAt?.toLocaleString('vi-VN'),
      tickets: tickets.map((t) => ({
        ...t,
        unitPrice: t.unitPrice.toLocaleString('vi-VN'),
      })),
      frontendUrl: frontendUrl,
    });
    const text = 
    `Booking Confirmed! Movie: ${booking.movieTitle}.\n` +
    `Showtime: ${booking.startAt?.toLocaleString('en-US')}.\n`+
    `Amount: ${payment.amount.toLocaleString('vi-VN')} VND.\n`+
    `View tickets at: ${frontendUrl}/my-tickets`;

    return this.mailService.send({
      to,
      subject: 'Payment Successful - Booking Confirmed',
      html,
      text,
    });
  }
}
