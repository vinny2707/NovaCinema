import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PaymentResDto } from './payment.res.dto';

export class PaymentDetailSeatResDto {
  @ApiProperty()
  @Expose()
  seatCode!: string;

  @ApiProperty()
  @Expose()
  seatType!: string;

  @ApiProperty()
  @Expose()
  unitPrice!: number;
}

export class PaymentDetailResDto extends PaymentResDto {
  @ApiProperty()
  @Expose()
  movieTitle!: string;

  @ApiProperty()
  @Expose()
  theaterName!: string;

  @ApiProperty()
  @Expose()
  roomName!: string;

  @ApiProperty()
  @Expose()
  roomType!: string;

  @ApiProperty()
  @Expose()
  startAt!: Date;

  @ApiProperty({ type: [PaymentDetailSeatResDto] })
  @Expose()
  @Type(() => PaymentDetailSeatResDto)
  seats!: PaymentDetailSeatResDto[];
}
