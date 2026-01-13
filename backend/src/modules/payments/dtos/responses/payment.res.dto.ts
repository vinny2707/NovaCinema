import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  PAYMENT_PROVIDER_VALUES,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUS_VALUES,
  PAYMENT_STATUSES,
  PaymentProvider,
  PaymentStatus,
} from '../../constants';

export class PaymentResDto {
  @ApiProperty({ example: '665c1e1f8e4b3a0012pay999' })
  @Expose()
  _id!: string;

  @ApiProperty({ example: '665c1e1f8e4b3a0012book999' })
  @Expose()
  bookingId!: string;

  @ApiProperty({ example: '665c1e1f8e4b3a0012user999' })
  @Expose()
  userId!: string;

  @ApiProperty({ example: '1736599999999' })
  @Expose()
  orderCode!: string;

  @ApiProperty({ example: 100_000 })
  @Expose()
  amount!: number;

  @ApiProperty({
    enum: PAYMENT_STATUS_VALUES,
    example: PAYMENT_STATUSES.PENDING,
  })
  @Expose()
  status!: PaymentStatus;

  @ApiPropertyOptional({
    type: Date,
  })
  @Expose()
  expiresAt!: Date | null;

  @ApiProperty({
    enum: PAYMENT_PROVIDER_VALUES,
    example: PAYMENT_PROVIDERS.PAYOS,
  })
  @Expose()
  provider!: PaymentProvider;

  @ApiProperty({
    type: String,
  })
  @Expose()
  transactionId?: string;

  @ApiPropertyOptional({
    type: Date,
  })
  @Expose()
  transactionAt?: Date;

  @ApiPropertyOptional({
    type: Date,
  })
  @Expose()
  createdAt?: Date;

  @ApiPropertyOptional({
    type: Date,
  })
  @Expose()
  updatedAt?: Date;
}
