import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { RoomType, SeatType } from 'src/modules/theaters/types';
import { Booking } from 'src/modules/bookings';
import { Showtime } from 'src/modules/showtimes';
import { User } from 'src/modules/users';
import {
  TICKET_STATUS_VALUES,
  TICKET_STATUSES,
  TicketStatus,
} from '../constants';

export type TicketDocument = HydratedDocument<Ticket>;

@Schema({ timestamps: true })
export class Ticket {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Booking.name,
    required: true,
    immutable: true,
  })
  bookingId!: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Showtime.name,
    required: true,
    immutable: true,
  })
  showtimeId!: Types.ObjectId;

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
  code!: string;

  @Prop({
    type: String,
    enum: TICKET_STATUS_VALUES,
    default: TICKET_STATUSES.VALID,
    required: true,
  })
  status!: TicketStatus;

  @Prop({ type: Date })
  scannedAt?: Date;

  @Prop({
    type: Date,
    immutable: true,
  })
  startAt?: Date;

  //-------------
  @Prop({
    type: String,
    immutable: true,
  })
  movieTitle?: string;

  @Prop({
    type: String,
    immutable: true,
  })
  moviePoster?: string;

  //-------------
  @Prop({
    type: String,
    immutable: true,
  })
  theaterName?: string;

  //-------------
  @Prop({
    type: String,
    immutable: true,
  })
  roomName?: string;

  @Prop({
    type: String,
    required: true,
    immutable: true,
  })
  roomType!: RoomType;

  //-------------
  @Prop({
    type: String,
    required: true,
    immutable: true,
  })
  seatType!: SeatType;

  @Prop({
    type: String,
    required: true,
    immutable: true,
  })
  seatCode!: string;

  @Prop({
    type: Number,
    required: true,
    immutable: true,
    min: 0,
  })
  unitPrice!: number;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);

TicketSchema.index({ bookingId: 1 });
TicketSchema.index({ userId: 1 });
TicketSchema.index({ showtimeId: 1 });
TicketSchema.index({ code: 1 }, { unique: true });
TicketSchema.index({ seatCode: 1, showtimeId: 1 }, { unique: true });
