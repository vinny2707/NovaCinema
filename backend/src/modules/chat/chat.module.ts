import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './controllers';
import { ChatService } from './services';
import { MoviesModule } from '../movies';
import { TheatersModule } from '../theaters';
import { PricingConfigModule } from '../pricing-configs';

@Module({
  imports: [
    ConfigModule,
    MoviesModule,
    TheatersModule,
    PricingConfigModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
