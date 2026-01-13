import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ChatReplyResDto {
  @ApiProperty({
    description: 'Câu trả lời từ chatbot',
    example: 'Xin chào! Mình là trợ lý ảo Nova Cinema 🎬',
  })
  @Expose()
  reply!: string;
}
