import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryRepository } from 'src/modules/base/repositories/query';
import { Ticket, TicketDocument } from '../schemas';

@Injectable()
export class TicketQueryRepository extends QueryRepository<
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
