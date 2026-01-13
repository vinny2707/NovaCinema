import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { TicketsController } from './controllers';
import { TicketService } from './services';
import { Ticket, TicketSchema } from './schemas';
import {
  TicketCommandRepository,
  TicketQueryRepository,
  TicketRepository,
} from './repositories';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
    ConfigModule,
  ],
  controllers: [TicketsController],
  providers: [
    TicketService,
    TicketCommandRepository,
    TicketQueryRepository,
    TicketRepository,
  ],
  exports: [TicketService],
})
export class TicketsModule {}
