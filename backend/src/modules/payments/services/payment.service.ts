import {
  BadRequestException,
  ConflictException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DateUtil } from 'src/common/utils';
import { TicketService } from 'src/modules/tickets';
import { BookingService } from 'src/modules/bookings';
import { UserService } from 'src/modules/users/services';
import { NotificationService } from 'src/modules/notifications';
import { BOOKING_STATUSES } from 'src/modules/bookings/constants';
import { PAYMENT_PROVIDERS, PAYMENT_STATUSES } from '../constants';
import { PaymentRepository } from '../repositories';
import { PayosService } from './payos.service';

@Injectable()
export class PaymentService {
  private readonly feBaseUrl: string;
  public constructor(
    private readonly config: ConfigService,
    private readonly paymentRepository: PaymentRepository,
    private readonly bookingService: BookingService,
    private readonly ticketService: TicketService,
    private readonly payosService: PayosService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {
    //
    this.feBaseUrl = config.getOrThrow('FE_BASE_URL');
  }

  //
  public async findPaymentById(id: string) {
    return this.paymentRepository.query.findOneById({
      id,
    });
  }

  public async findPaymentByUserId(userId: string) {
    return this.paymentRepository.query.findMany({
      filter: {
        userId,
      },
    });
  }

  public async findPaymentDetailById(id: string) {
    const payment = await this.findPaymentById(id);
    if (!payment) return null;
    const booking = await this.bookingService.findBookingById(
      payment.bookingId,
    );
    if (!booking) throw new NotFoundException('Booking not found');
    return {
      ...payment,
      movieTitle: booking.movieTitle,
      theaterName: booking.theaterName,
      roomName: booking.roomName,
      roomType: booking.roomType,
      startAt: booking.startAt,
      seats: booking.seats,
    };
  }

  public async findPaymentByBookingId(bookingId: string) {
    return this.paymentRepository.query.findOne({
      filter: {
        bookingId: bookingId,
      },
    });
  }

  public async findPaymentByOrderCode(orderCode: string) {
    return this.paymentRepository.query.findOne({
      filter: {
        orderCode: orderCode,
      },
    });
  }

  //
  public async createPayment(bookingId: string) {
    const booking = await this.getValidatedBooking(bookingId);

    const now = DateUtil.nowUTC();
    const existing = await this.paymentRepository.query.findOne({
      filter: {
        bookingId: bookingId,
        status: PAYMENT_STATUSES.PENDING,
        expiresAt: { $gt: now },
      },
    });
    if (existing) {
      throw new ConflictException(
        'A payment is already pending for this booking',
      );
    }

    const paymentExpiresAt = DateUtil.add(now, { minute: 5 });

    // Update booking status and expires
    await this.bookingService.markDraftToPendingPayment(bookingId);

    // Generate PayOS payment link
    const paymentLink = await this.payosService.createPaymentLink({
      bookingId: booking._id,
      amount: booking.finalAmount,
      expiresInSeconds: 5 * 60, // 5 minutes
    });

    // Create payment
    const { insertedItem: payment } =
      await this.paymentRepository.command.createOne({
        data: {
          bookingId: booking._id,
          userId: booking.userId,
          amount: booking.finalAmount,
          status: PAYMENT_STATUSES.PENDING,
          provider: PAYMENT_PROVIDERS.PAYOS,
          expiresAt: paymentExpiresAt,
          orderCode: paymentLink.orderCode.toString(),
        },
      });

    return {
      ...payment,
      movieTitle: booking.movieTitle,
      theaterName: booking.theaterName,
      startAt: booking.startAt,
      roomName: booking.roomName,
      roomType: booking.roomType,
      seats: booking.seats,
      checkoutUrl: paymentLink.checkoutUrl,
      qrCode: paymentLink.qrCode,
    };
  }

  public async cancelPayment(id: string, reason?: string) {
    const payment = await this.paymentRepository.query.findOneById({ id });
    if (!payment) throw new NotFoundException('Payment not found');

    await this.payosService.cancelPaymentLink(
      Number(payment.orderCode),
      reason,
    );

    const { modifiedItem } = await this.paymentRepository.command.updateOne({
      filter: { _id: payment._id },
      update: {
        status: PAYMENT_STATUSES.CANCELLED,
        expiresAt: null,
      },
    });

    return modifiedItem;
  }

  public async handleWebhook(payload: any) {
    console.log('Webhook payload received:', payload);
    const parsed = await this.payosService.parseWebhook(payload);
    if (!parsed.isPaid) {
      console.log('Payment status is not success');
      return;
    }

    const existing = await this.findPaymentByOrderCode(parsed.orderCode);
    if (!existing) {
      console.log('Payment not found in DB:', parsed.orderCode);
      return;
    }
    if (existing.status === PAYMENT_STATUSES.PAID) {
      return;
    }

    const now = DateUtil.nowUTC();
    const { modifiedItem: updated } =
      await this.paymentRepository.command.updateOne({
        filter: {
          _id: existing._id,
          status: { $ne: PAYMENT_STATUSES.PAID },
        },
        update: {
          status: PAYMENT_STATUSES.PAID,
          transactionId: parsed.transactionId,
          transactionAt: parsed.transactionAt ?? now,
          expiresAt: null,
        },
      });
    if (!updated) {
      return;
    }
    const booking = await this.bookingService.markPendingPaymentToConfirmed(
      existing.bookingId,
    );
    const tickets = await this.ticketService.createTicketsFromBooking(booking);

    const user = await this.userService.findUserById(existing.userId);
    console.log('User found:', user);
    if (user) {
      const result = await this.notificationService.sendPaymentSuccessEmail({
        to: user.email,
        payment: updated,
        booking: booking,
        frontendUrl: this.feBaseUrl,
        tickets: tickets.map((t) => ({
          code: t.code,
          seatCode: t.seatCode,
          seatType: t.seatType,
          unitPrice: t.unitPrice,
        })),
      });
      console.log('Email sent successfully', result);
    }
  }

  private async getValidatedBooking(bookingId: string) {
    const booking = await this.bookingService.findBookingById(bookingId);

    if (!booking) throw new NotFoundException('Booking not found');

    switch (booking.status) {
      case BOOKING_STATUSES.DRAFT:
        if (!booking.expiresAt || booking.expiresAt <= DateUtil.nowUTC()) {
          throw new GoneException('Booking expired');
        }
        break;
      case BOOKING_STATUSES.PENDING_PAYMENT:
        if (!booking.expiresAt || booking.expiresAt <= DateUtil.nowUTC()) {
          throw new GoneException('Booking payment expired');
        }
        break;
      case BOOKING_STATUSES.CANCELLED:
        throw new BadRequestException('Booking is cancelled');
      case BOOKING_STATUSES.CONFIRMED:
        throw new ConflictException('Booking already confirmed');
      case BOOKING_STATUSES.EXPIRED:
        throw new GoneException('Booking is expired');
      default:
        throw new BadRequestException('Invalid booking status');
    }

    return booking;
  }
}
