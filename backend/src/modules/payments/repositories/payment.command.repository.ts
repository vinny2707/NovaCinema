import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommandRepository } from 'src/modules/base/repositories/command';
import { Payment, PaymentDocument } from '../schemas';

@Injectable()
export class PaymentCommandRepository extends CommandRepository<
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
