import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public, WrapOkResponse } from 'src/common/decorators';
import { PaymentService } from '../services';
import { WebhookReqDto } from '../dtos/requests';
import {
  PaymentCheckoutResDto,
  PaymentDetailResDto,
  PaymentResDto,
} from '../dtos/responses';

@ApiTags('Payments')
@Controller()
export class PaymentsController {
  public constructor(private readonly paymentService: PaymentService) {
    //
  }

  @ApiOperation({ description: 'Create payment for booking' })
  @WrapOkResponse({ dto: PaymentCheckoutResDto })
  @HttpCode(HttpStatus.CREATED)
  @Post('bookings/:bookingId/payments')
  public async createPayment(
    @Param('bookingId', ParseObjectIdPipe) bookingId: string,
  ) {
    return this.paymentService.createPayment(bookingId);
  }

  @ApiOperation({ description: 'Get payment by ID' })
  @WrapOkResponse({ dto: PaymentDetailResDto })
  @HttpCode(HttpStatus.OK)
  @Get('payments/:id')
  public async getPayment(@Param('id', ParseObjectIdPipe) id: string) {
    const payment = await this.paymentService.findPaymentDetailById(id);
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  @ApiOperation({ description: 'PayOS webhook handler' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('payments/webhook')
  public async handleWebhook(@Body() body: WebhookReqDto) {
    await this.paymentService.handleWebhook(body);

    return { success: true };
  }
}
