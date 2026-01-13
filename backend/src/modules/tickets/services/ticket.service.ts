import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { DateUtil } from 'src/common/utils';
import { RoomType, SeatType } from 'src/modules/theaters/types';
import { TICKET_STATUSES } from '../constants';
import { TicketRepository } from '../repositories';

// --- Constants ---
const ROOM_TYPE_CODE_MAP: Record<RoomType, string> = {
  '2D': '2D',
  '3D': '3D',
  VIP: 'VP',
} as const;

const SEAT_TYPE_CODE_MAP: Record<SeatType, string> = {
  NORMAL: 'NM',
  VIP: 'VP',
  COUPLE: 'CP',
} as const;

interface SeatInput {
  seatCode: string;
  seatType: SeatType;
  unitPrice: number;
}

interface BookingInput {
  _id: string;
  userId: string;
  showtimeId: string;
  movieTitle?: string;
  moviePoster?: string;
  theaterName?: string;
  roomName?: string;
  roomType: RoomType;
  startAt?: Date;
  seats: ReadonlyArray<SeatInput>;
}

@Injectable()
export class TicketService {
  public constructor(private readonly ticketRepository: TicketRepository) {
    //
  }

  public async findTicketByCode(code: string) {
    return this.ticketRepository.query.findOne({
      filter: {
        code,
      },
    });
  }

  // --- Query ---
  public async findTicketByBookingId(bookingId: string) {
    return this.ticketRepository.query.findMany({
      filter: {
        bookingId,
      },
    });
  }

  /** CREATE */
  public async createTicketsFromBooking(input: BookingInput) {
    const ticketsData = input.seats.map((seat, index) => {
      const code = this.generateTicketCode(input.roomType, seat.seatType);

      return {
        bookingId: input._id,
        showtimeId: input.showtimeId,
        userId: input.userId,
        code: code,
        status: TICKET_STATUSES.VALID,
        movieTitle: input.movieTitle,
        moviePoster: input.moviePoster,
        theaterName: input.theaterName,
        roomName: input.roomName,
        roomType: input.roomType,
        startAt: input.startAt,
        seatType: seat.seatType,
        seatCode: seat.seatCode,
        unitPrice: seat.unitPrice,
      };
    });

    const { insertedCount, insertedItems } =
      await this.ticketRepository.command.createMany({
        data: ticketsData,
      });

    return insertedItems;
  }

  /** UPDATE */
  public async checkInTicket(code: string) {
    const { modifiedItem: ticket } =
      await this.ticketRepository.command.updateOne({
        filter: {
          code,
          status: TICKET_STATUSES.VALID,
        },
        update: {
          status: TICKET_STATUSES.USED,
          scannedAt: DateUtil.nowUTC(),
        },
      });

    return ticket;
  }

  /**
   * @returns RR-HHHHHHHHHHHHHHHHHHHHHHHH-SS
   * @example 2D-K7A93HHHHHHHHHHHHHHNCW2X-NM
   */
  private generateTicketCode(roomType: RoomType, seatType: SeatType): string {
    const roomChar = ROOM_TYPE_CODE_MAP[roomType] || 'XX';
    const seatChar = SEAT_TYPE_CODE_MAP[seatType] || 'SS';
    const oid = new Types.ObjectId().toHexString().toUpperCase();

    return `${roomChar}-${oid}-${seatChar}`;
  }
}
