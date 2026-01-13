import { Injectable } from '@nestjs/common';
import { TicketCommandRepository } from './ticket.command.repository';
import { TicketQueryRepository } from './ticket.query.repository';

@Injectable()
export class TicketRepository {
  public constructor(
    public readonly command: TicketCommandRepository,
    public readonly query: TicketQueryRepository,
  ) {
    //
  }
}
