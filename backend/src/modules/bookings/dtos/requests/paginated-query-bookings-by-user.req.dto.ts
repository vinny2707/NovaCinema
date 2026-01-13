import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { SortFields } from 'src/common/types';
import { ROOM_TYPE_VALUES } from 'src/modules/theaters/constants';
import { ToArray, ToSortObject } from 'src/common/decorators';
import { RoomType } from 'src/modules/theaters/types';
import { BOOKING_STATUS_VALUES } from '../../constants';
import { BookingStatus } from '../../types';

export class PaginatedQueryBookingsByUserReqDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Filter by movie ID (indirect via showtime)',
  })
  @IsOptional()
  @IsString()
  movieId?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by movie title',
  })
  @IsOptional()
  @IsString()
  movieTitle?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by theater ID (indirect via showtime)',
  })
  @IsOptional()
  @IsString()
  theaterId?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by theater name',
  })
  @IsOptional()
  @IsString()
  theaterName?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by room ID (indirect via showtime)',
  })
  @IsOptional()
  @IsString()
  roomId?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by room name',
  })
  @IsOptional()
  @IsString()
  roomName?: string;

  @ApiPropertyOptional({
    type: [String],
    enum: ROOM_TYPE_VALUES,
    description: 'Filter by room type',
  })
  @IsOptional()
  @IsEnum(ROOM_TYPE_VALUES, {
    each: true,
    message: `Valid values: ${ROOM_TYPE_VALUES.join(', ')}`,
  })
  @ToArray()
  roomType?: RoomType[];

  @ApiPropertyOptional({
    type: [String],
    enum: BOOKING_STATUS_VALUES,
    description: 'Filter by booking status',
  })
  @IsOptional()
  @IsEnum(BOOKING_STATUS_VALUES, {
    each: true,
    message: `Valid values: ${BOOKING_STATUS_VALUES.join(', ')}`,
  })
  @ToArray()
  status?: BookingStatus[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Sort fields (createdAt, startAt, amount, status)',
    example: ['created:asc'],
  })
  @IsOptional()
  @ToSortObject()
  sort?: SortFields;

  @ApiPropertyOptional({
    type: Date,
    description: 'Filter bookings created from this date (inclusive)',
    example: '2026-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  from?: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Filter bookings created until this date (inclusive)',
    example: '2026-01-31',
  })
  @IsOptional()
  @Type(() => Date)
  to?: Date;

  @ApiPropertyOptional({
    type: Number,
    description: 'Page number for pagination',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;
}
