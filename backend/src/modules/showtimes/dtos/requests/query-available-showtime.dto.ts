import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsMongoId,
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SortFields } from 'src/common/types';
import { ToArray, ToDateTime, ToSortObject } from 'src/common/decorators';
import { ROOM_TYPE_VALUES } from 'src/modules/theaters/constants';
import { RoomType } from 'src/modules/theaters/types';

export class QueryAvailableShowtimesReqDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Search across movieTitle, theaterName, roomName',
    example: 'Avengers',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Sort orders',
    example: ['startAt:asc'],
  })
  @IsOptional()
  @ToSortObject()
  sort?: SortFields;

  @ApiProperty({
    description: 'Filter by movie ID',
    example: '67a1234bcf90123456789def',
  })
  @IsMongoId()
  movieId!: string;

  @ApiPropertyOptional({
    description: 'Filter by movie title (snapshot)',
    example: 'Avengers: Endgame',
  })
  @IsOptional()
  @IsString()
  movieTitle?: string;

  @ApiProperty({
    description: 'Filter by theater ID',
    example: '67b2234bcf90123456789aaa',
  })
  @IsMongoId()
  theaterId!: string;

  @ApiPropertyOptional({
    description: 'Filter by theater name (snapshot)',
    example: 'CGV Vincom',
  })
  @IsOptional()
  @IsString()
  theaterName?: string;

  @ApiPropertyOptional({
    description: 'Filter by room ID',
    example: '67c3334bcf90123456789bbb',
  })
  @IsOptional()
  @IsMongoId()
  roomId?: string;

  @ApiPropertyOptional({
    description: 'Filter by room name (snapshot)',
    example: 'Room 1',
  })
  @IsOptional()
  @IsString()
  roomName?: string;

  @ApiPropertyOptional({
    type: [String],
    enum: ROOM_TYPE_VALUES,
    description: 'Filter by room type',
    example: ['IMAX', '3D'],
  })
  @IsOptional()
  @IsEnum(ROOM_TYPE_VALUES, { each: true })
  @ToArray()
  roomType?: RoomType[];

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Showtimes date (yyyy-MM-dd)',
    example: '2025-12-20',
  })
  @IsOptional()
  @IsDate({ message: 'date must be yyyy-MM-dd' })
  @ToDateTime()
  date?: Date;
}
