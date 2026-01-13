import { Injectable } from '@nestjs/common';
import { PaymentCommandRepository } from './payment.command.repository';
import { PaymentQueryRepository } from './payment.query.repository';

@Injectable()
export class PaymentRepository {
  public constructor(
    public readonly command: PaymentCommandRepository,
    public readonly query: PaymentQueryRepository,
  ) {
    //
  }
}
