import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from 'src/modules/users';
import { Showtime } from 'src/modules/showtimes';
import { BOOKING_STATUS_VALUES, BOOKING_STATUSES } from '../constants';
import { BookingStatus } from '../types';
import { BookingSeat, BookingSeatSchema } from './booking-seat.schema';
import { RoomType } from 'src/modules/theaters/types';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true })
export class Booking {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
    immutable: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Showtime.name,
    required: true,
    immutable: true,
  })
  showtimeId!: Types.ObjectId;

  @Prop({
    type: String,
  })
  roomType!: RoomType;

  @Prop({
    type: Date,
  })
  startAt!: Date;

  @Prop({
    required: true,
    enum: BOOKING_STATUS_VALUES,
    default: BOOKING_STATUSES.DRAFT,
  })
  status!: BookingStatus;

  @Prop({
    type: Date,
    default: null,
  })
  expiresAt!: Date | null; // only affects draft

  @Prop({
    required: true,
    type: [BookingSeatSchema],
    default: [],
  })
  seats!: BookingSeat[];

  @Prop({
    type: Number,
    required: true,
    immutable: true,
    min: 0,
  })
  baseAmount!: number;

  // Membership
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Membership',
  })
  membershipId?: Types.ObjectId;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  membershipDiscountAmount?: number;

  @Prop()
  membershipTier?: string;

  // Voucher
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Voucher',
  })
  voucherId?: Types.ObjectId;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  voucherDiscountAmount?: number;

  @Prop()
  voucherCode?: string;

  //
  @Prop({
    type: Number,
    min: 0,
    default: 0,
  })
  discountAmount!: number;

  //
  @Prop({
    type: Number,
    required: true,
    min: 0,
  })
  finalAmount!: number;

  // --- Snapshot for history --
  @Prop() username?: string;
  @Prop() movieTitle?: string;
  @Prop() theaterName?: string;
  @Prop() roomName?: string;

  //
  @Prop({
    type: Date,
  })
  createdAt?: Date;

  @Prop({
    type: Date,
  })
  updatedAt?: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

BookingSchema.index({ userId: 1, createdAt: -1 });
// BookingSchema.index({ status: 1 });
BookingSchema.index({ showtimeId: 1 });
BookingSchema.index({ showtimeId: 1, status: 1, expiresAt: 1 });
// BookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

BookingSchema.index(
  { userId: 1, showtimeId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: [BOOKING_STATUSES.DRAFT, BOOKING_STATUSES.PENDING_PAYMENT],
      },
    },
  },
);
