import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageReqDto {
  @ApiProperty({
    description: 'Tin nhắn của người dùng',
    example: 'Giá vé bao nhiêu?',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty({ message: 'Tin nhắn không được để trống' })
  @MaxLength(1000, { message: 'Tin nhắn không được quá 1000 ký tự' })
  message!: string;
}
