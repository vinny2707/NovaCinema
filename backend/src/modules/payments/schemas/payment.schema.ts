import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from 'src/modules/users';
import { Booking } from 'src/modules/bookings';
import {
  PAYMENT_PROVIDERS,
  PAYMENT_STATUS_VALUES,
  PAYMENT_STATUSES,
  PaymentProvider,
  PaymentStatus,
} from '../constants';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Booking.name,
    required: true,
    immutable: true,
  })
  bookingId!: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
    immutable: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    immutable: true,
  })
  orderCode!: string;

  @Prop({
    type: Number,
    required: true,
    immutable: true,
  })
  amount!: number;

  @Prop({
    type: String,
    required: true,
    enum: PAYMENT_STATUS_VALUES,
    default: PAYMENT_STATUSES.PENDING,
  })
  status!: PaymentStatus;

  @Prop({
    type: Date,
    default: null,
  })
  expiresAt!: Date | null;

  @Prop({
    type: String,
    required: true,
    default: PAYMENT_PROVIDERS.PAYOS,
    immutable: true,
  })
  provider!: PaymentProvider;

  @Prop({
    type: String,
    immutable: true,
  })
  transactionId?: string;

  @Prop({
    type: Date,
  })
  transactionAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ status: 1, expiresAt: 1 });
PaymentSchema.index(
  { bookingId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: PAYMENT_STATUSES.PENDING,
    },
  },
);
PaymentSchema.index({ userId: 1, createdAt: -1 });
