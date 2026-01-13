import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SeatType } from 'src/modules/theaters/types';
import { BOOKING_STATUS_VALUES, BOOKING_STATUSES } from '../../constants';
import { BookingStatus } from '../../types';
import { BookingSeat } from '../../schemas';

class BookingSeatResDto {
  @ApiProperty({ example: 'A10' })
  @Expose()
  seatCode!: string;

  @ApiProperty({ example: 'VIP' })
  @Expose()
  seatType!: SeatType;

  @ApiProperty({ example: 120000 })
  @Expose()
  unitPrice!: number;
}

export class BookingResDto {
  @ApiProperty({ example: '665c1e1f8e4b3a0012abc999' })
  @Expose()
  _id!: string;

  @ApiProperty({ example: '665c1e1f8e4b3a0012user999' })
  @Expose()
  userId!: string;

  @ApiProperty({ example: '665c1e1f8e4b3a0012show999' })
  @Expose()
  showtimeId!: string;

  @ApiProperty()
  @Expose()
  roomType!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  startAt!: Date;

  @ApiProperty({
    enum: BOOKING_STATUS_VALUES,
    example: BOOKING_STATUSES.DRAFT,
  })
  @Expose()
  status!: BookingStatus;

  // ---- Seats ----
  @ApiProperty({ type: [BookingSeatResDto] })
  @Expose()
  @Type(() => BookingSeatResDto)
  seats!: BookingSeat[];

  // ---- Amounts ----
  @ApiProperty({ example: 240000 })
  @Expose()
  baseAmount!: number;

  @ApiProperty({ example: 0 })
  @Expose()
  discountAmount!: number;

  @ApiProperty({ example: 240000 })
  @Expose()
  finalAmount!: number;

  // ---- Expire ----
  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
  })
  @Expose()
  expiresAt!: Date | null;

  // ---- TODO: Membership ----
  // @ApiPropertyOptional()
  // @Expose()
  // membershipId?: string;

  // @ApiPropertyOptional({ example: 0 })
  // @Expose()
  // membershipDiscountAmount?: number;

  // @ApiPropertyOptional({ example: 'GOLD' })
  // @Expose()
  // membershipTier?: string;

  // ---- TODO: Voucher ----
  // @ApiPropertyOptional()
  // @Expose()
  // voucherId?: string;

  // @ApiPropertyOptional({ example: 0 })
  // @Expose()
  // voucherDiscountAmount?: number;

  // @ApiPropertyOptional({ example: 'SUMMER2026' })
  // @Expose()
  // voucherCode?: string;

  // ---- Snapshot ----
  @ApiPropertyOptional()
  @Expose()
  username?: string;

  @ApiPropertyOptional()
  @Expose()
  movieTitle?: string;

  @ApiPropertyOptional()
  @Expose()
  theaterName?: string;

  @ApiPropertyOptional()
  @Expose()
  roomName?: string;

  // ---- Audit ----
  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt!: Date;
}
