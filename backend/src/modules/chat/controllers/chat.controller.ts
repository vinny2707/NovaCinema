import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public, WrapOkResponse } from 'src/common/decorators';
import { ChatService } from '../services';
import { ChatMessageReqDto } from '../dtos/requests';
import { ChatReplyResDto } from '../dtos/responses';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Chat với trợ lý ảo Nova Cinema' })
  @WrapOkResponse({ dto: ChatReplyResDto })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post()
  async chat(@Body() dto: ChatMessageReqDto): Promise<ChatReplyResDto> {
    try {
      const reply = await this.chatService.processMessage(dto.message);
      return { reply };
    } catch (error) {
      console.error('Chat error:', error);
      throw new InternalServerErrorException(
        'Hệ thống đang bận, vui lòng thử lại sau! 🙏',
      );
    }
  }
}
