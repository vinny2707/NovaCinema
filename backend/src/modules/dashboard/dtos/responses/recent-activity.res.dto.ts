import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ActivityItemDto {
  @Expose()
  @ApiProperty({
    enum: ['movie', 'user', 'theater', 'booking'],
    description: 'Type of activity',
  })
  type!: 'movie' | 'user' | 'theater' | 'booking';

  @Expose()
  @ApiProperty({ example: 'Phim mới được thêm', description: 'Activity title' })
  title!: string;

  @Expose()
  @ApiProperty({
    example: 'The Dark Knight',
    description: 'Activity description',
  })
  description!: string;

  @Expose()
  @ApiProperty({ description: 'When the activity occurred' })
  createdAt!: Date;
}

export class RecentActivityResDto {
  @Expose()
  @Type(() => ActivityItemDto)
  @ApiProperty({ type: [ActivityItemDto], description: 'List of recent activities' })
  activities!: ActivityItemDto[];
}

