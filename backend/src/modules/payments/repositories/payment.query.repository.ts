import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryRepository } from 'src/modules/base/repositories/query';
import { Payment, PaymentDocument } from '../schemas';

@Injectable()
export class PaymentQueryRepository extends QueryRepository<
  Payment,
  PaymentDocument
> {
  public constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {
    super(paymentModel);
  }
}
