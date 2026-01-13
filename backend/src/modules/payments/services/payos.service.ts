import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';
import { createHash, randomBytes } from 'crypto';

export type PayosWebhookParsed = {
  isPaid: boolean;
  orderCode: string;
  amount?: number;
  currency?: string;
  transactionId?: string;
  transactionAt?: Date;
};

export type CreatePaymentLinkInput = {
  bookingId: string;
  amount: number;
  expiresInSeconds: number;
};

export type CreatePaymentLinkOutput = {
  orderCode: number;
  checkoutUrl: string;
  qrCode?: string;
  expiresAt: Date;
};

@Injectable()
export class PayosService {
  private readonly payos: PayOS;
  private readonly returnUrl: string;
  private readonly cancelUrl: string;

  public constructor(private readonly config: ConfigService) {
    this.payos = new PayOS({
      clientId: config.getOrThrow('PAYOS_CLIENT_ID'),
      apiKey: config.getOrThrow('PAYOS_API_KEY'),
      checksumKey: config.getOrThrow('PAYOS_CHECKSUM_KEY'),
    });

    const feBaseUrl = config.getOrThrow('FE_BASE_URL');
    this.returnUrl = `${feBaseUrl}/${config.getOrThrow('PAYOS_RETURN_PATH')}`;
    this.cancelUrl = `${feBaseUrl}/${config.getOrThrow('PAYOS_CANCEL_PATH')}`;
  }

  public async parseWebhook(payload: any): Promise<PayosWebhookParsed> {
    try {
      const verifiedData = await this.payos.webhooks.verify(payload);

      return {
        isPaid: payload.code === '00',
        orderCode: verifiedData.orderCode.toString(),
        amount: verifiedData.amount,
        currency: verifiedData.currency,
        transactionId: verifiedData.reference,
        transactionAt: verifiedData.transactionDateTime
          ? new Date(verifiedData.transactionDateTime)
          : undefined,
      };
    } catch (error) {
      throw new BadRequestException('Invalid PayOS webhook signature');
    }
  }

  public async createPaymentLink(
    input: CreatePaymentLinkInput,
  ): Promise<CreatePaymentLinkOutput> {
    const orderCode = this.generateOrderCode(input.bookingId);
    const expiredAt = Math.floor(Date.now() / 1000) + input.expiresInSeconds;

    const paymentLink = await this.payos.paymentRequests.create({
      orderCode,
      amount: input.amount,
      description: `Booking ${orderCode}`,
      returnUrl: this.returnUrl,
      cancelUrl: this.cancelUrl,
      expiredAt,
    });

    return {
      orderCode,
      checkoutUrl: paymentLink.checkoutUrl,
      qrCode: paymentLink.qrCode,
      expiresAt: new Date(paymentLink.expiredAt! * 1000),
    };
  }

  public async cancelPaymentLink(orderCode: number, reason?: string) {
    try {
      return await this.payos.paymentRequests.cancel(orderCode, reason);
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Cancel PayOS failed: ${error.message}`,
      );
    }
  }

  private generateOrderCode(bookingId: string): number {
    const entropy = randomBytes(4).toString('hex');
    const hash = createHash('sha256')
      .update(`${bookingId}${Date.now()}${entropy}`)
      .digest('hex');
    return Number(
      BigInt('0x' + hash)
        .toString()
        .slice(0, 14),
    );
  }
}
