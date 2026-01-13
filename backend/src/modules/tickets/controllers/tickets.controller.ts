import { ParseObjectIdPipe } from '@nestjs/mongoose';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Public,
  RequireRoles,
  WrapListResponse,
  WrapOkResponse,
} from 'src/common/decorators';
import { USER_ROLES } from 'src/modules/users/constants';
import { TicketService } from '../services';
import { TicketResDto } from '../dtos/responses';

@ApiTags('Tickets')
@Controller()
export class TicketsController {
  public constructor(
    private readonly ticketService: TicketService,
    //
  ) {
    //
  }

  @ApiOperation({ description: 'Get ticket by Code' })
  @WrapOkResponse({ dto: TicketResDto })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('tickets/:code')
  public async getByCode(@Param('code') code: string) {
    const existing = await this.ticketService.findTicketByCode(code);
    if (!existing) throw new NotFoundException('Ticket not found');
    return existing;
  }

  @ApiOperation({ description: 'Get tickets by Booking ID' })
  @WrapListResponse({ dto: TicketResDto })
  @HttpCode(HttpStatus.OK)
  @Get('bookings/:bookingId/tickets')
  public async getTicketsByBookingId(
    @Param('bookingId', ParseObjectIdPipe) bookingId: string,
  ) {
    return this.ticketService.findTicketByBookingId(bookingId);
  }

  @ApiOperation({ description: 'Check-in ticket' })
  @WrapOkResponse({ dto: TicketResDto })
  @RequireRoles(USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch('tickets/:code/check-in')
  public async checkIn(@Param('code') code: string) {
    const existing = await this.ticketService.checkInTicket(code);
    if (!existing) throw new NotFoundException('Ticket invalid or not found');
    return existing;
  }
}
