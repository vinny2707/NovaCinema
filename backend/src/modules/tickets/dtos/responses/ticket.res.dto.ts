import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class TicketResDto {
  @ApiProperty({
    type: String,
    description: 'Ticket ID',
  })
  @Expose()
  _id!: string;

  @ApiProperty({
    type: String,
    description: 'Ticket Code',
    example: '2D-K7A93NCW2X-NM',
  })
  @Expose()
  code!: string;

  @ApiProperty({
    type: String,
    description: 'Booking ID',
  })
  @Expose()
  bookingId!: string;

  @ApiProperty({
    type: String,
    description: 'Showtime ID',
  })
  @Expose()
  showtimeId!: string;

  @ApiProperty({
    type: String,
    description: 'User ID',
  })
  @Expose()
  userId!: string;

  @ApiProperty({
    type: String,
    description: 'Ticket Status',
    example: 'VALID',
  })
  @Expose()
  status!: string;

  @ApiPropertyOptional({
    type: Date,
    description: 'Scanned At',
  })
  @Expose()
  scannedAt?: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Start At',
  })
  @Expose()
  startAt?: Date;

  // --- Snapshot ---
  @ApiPropertyOptional({
    type: String,
    description: 'Movie Title',
  })
  @Expose()
  movieTitle?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Movie Poster',
  })
  @Expose()
  moviePoster?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Theater Name',
  })
  @Expose()
  theaterName?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Room Name',
  })
  @Expose()
  roomName?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Room Type',
  })
  @Expose()
  roomType?: string;

  // --- Seat Info ---
  @ApiProperty({
    type: String,
    description: 'Seat Type',
  })
  @Expose()
  seatType!: string;

  @ApiProperty({
    type: String,
    description: 'Seat Code',
    example: 'A1',
  })
  @Expose()
  seatCode!: string;

  @ApiProperty({
    type: Number,
    description: 'Unit Price',
    example: 100000,
  })
  @Expose()
  unitPrice!: number;

  @ApiPropertyOptional({
    type: Date,
    description: 'Creation timestamp',
  })
  @Expose()
  createdAt?: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Last update timestamp',
  })
  @Expose()
  updatedAt?: Date;
}
