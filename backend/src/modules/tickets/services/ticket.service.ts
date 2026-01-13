import Hashids from 'hashids';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  private hashids: Hashids;

  public constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly configService: ConfigService,
  ) {
    const salt = this.configService.getOrThrow<string>('TICKET_CODE_SALT');
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.hashids = new Hashids(salt, 10, alphabet);
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
      const code = this.generateTicketCode(
        input._id,
        input.roomType,
        seat.seatType,
        index,
      );

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
   * @returns RR-HHHHHHHHHH-SS
   * @example 2D-K7A93NCW2X-NM
   */
  private generateTicketCode(
    bookingId: string,
    roomType: RoomType,
    seatType: SeatType,
    index: number,
  ): string {
    const roomChar = ROOM_TYPE_CODE_MAP[roomType] || 'XX';
    const seatChar = SEAT_TYPE_CODE_MAP[seatType] || 'SS';

    const bookingSeed = parseInt(bookingId.slice(-10), 16);
    const timeSeed = new Date().getMilliseconds() + index;
    const hash = this.hashids.encode(bookingSeed, timeSeed);
    const middleHash = hash.padEnd(10, '0').slice(0, 10);

    return `${roomChar}-${middleHash}-${seatChar}`;
  }
}
