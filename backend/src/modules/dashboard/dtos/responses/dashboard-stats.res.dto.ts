import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class StatItemDto {
  @Expose()
  @ApiProperty({ example: 156, description: 'Total count' })
  value!: number;

  @Expose()
  @ApiProperty({ example: 12, description: 'Growth percentage from last month' })
  growth!: number;
}

export class DashboardStatsResDto {
  @Expose()
  @Type(() => StatItemDto)
  @ApiProperty({ type: StatItemDto, description: 'Total movies statistics' })
  totalMovies!: StatItemDto;

  @Expose()
  @Type(() => StatItemDto)
  @ApiProperty({ type: StatItemDto, description: 'Total users statistics' })
  totalUsers!: StatItemDto;

  @Expose()
  @Type(() => StatItemDto)
  @ApiProperty({ type: StatItemDto, description: 'Revenue statistics (VND)' })
  revenue!: StatItemDto;

  @Expose()
  @Type(() => StatItemDto)
  @ApiProperty({ type: StatItemDto, description: 'Total confirmed bookings statistics' })
  totalBookings!: StatItemDto;
}

