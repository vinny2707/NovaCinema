import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class HealthResDto {
  @ApiProperty({
    type: String,
    example: 'ok',
    description: 'Service health status',
  })
  @Expose()
  status!: 'ok';

  @ApiProperty({
    type: String,
    example: 'nova-cinema-backend',
    description: 'Service name',
  })
  @Expose()
  service!: string;

  @ApiProperty({
    type: Number,
    example: 12345,
    description: 'Process uptime (seconds)',
  })
  @Expose()
  uptime!: number;
}
