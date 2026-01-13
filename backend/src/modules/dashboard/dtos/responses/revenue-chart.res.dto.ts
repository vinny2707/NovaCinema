import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class RevenueDataPointDto {
  @Expose()
  @ApiProperty({ example: '2026-01-01', description: 'Date of the data point' })
  date!: string;

  @Expose()
  @ApiProperty({ example: 5000000, description: 'Revenue amount in VND' })
  revenue!: number;

  @Expose()
  @ApiProperty({ example: 50, description: 'Number of transactions' })
  transactions!: number;
}

export class RevenueChartResDto {
  @Expose()
  @Type(() => RevenueDataPointDto)
  @ApiProperty({ type: [RevenueDataPointDto], description: 'Daily revenue data points' })
  data!: RevenueDataPointDto[];

  @Expose()
  @ApiProperty({ example: 50000000, description: 'Total revenue in the period' })
  totalRevenue!: number;

  @Expose()
  @ApiProperty({ example: 500, description: 'Total transactions in the period' })
  totalTransactions!: number;
}
