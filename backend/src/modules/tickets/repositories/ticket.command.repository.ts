import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommandRepository } from 'src/modules/base/repositories/command';
import { Ticket, TicketDocument } from '../schemas';

@Injectable()
export class TicketCommandRepository extends CommandRepository<
  Ticket,
  TicketDocument
> {
  public constructor(
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
  ) {
    super(ticketModel);
  }
}
