import escapeStringRegexp from 'escape-string-regexp';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SortFields } from 'src/common/types';
import { DateUtil } from 'src/common/utils';
import { pickSortableFields } from 'src/common/helpers';
import { RoomType, SeatType } from 'src/modules/theaters/types';
import { UserService } from 'src/modules/users';
import { ShowtimeService } from 'src/modules/showtimes';
import { RoomService, SeatService } from 'src/modules/theaters';
import { PricingConfigService } from 'src/modules/pricing-configs';
import {
  BOOKING_EXPIRE_MINUTES,
  BOOKING_LIMITS,
  BOOKING_SEAT_STATUSES,
  BOOKING_STATUSES,
} from '../constants';
import { BookingSeatStatus, BookingStatus } from '../types';
import { BookingRepository } from '../repositories';
import { BookingSeat } from '../schemas';

/** */
const QUERY_FIELDS = {
  SEARCHABLE: ['username', 'movieTitle', 'theaterName', 'roomName'] as const,
  REGEX_MATCH: ['username', 'movieTitle', 'theaterName', 'roomName'] as const,
  ARRAY_MATCH: ['status', 'roomType'] as const,
  EXACT_MATCH: [
    'userId',
    'showtimeId',
    'movieId',
    'theaterId',
    'roomId',
  ] as const,
  SORTABLE: ['createdAt', 'startAt', 'finalAmount', 'status'] as const,
} as const;

type PaginatedQueryCriteria = {
  userId?: string;
  username?: string;
  showtimeId?: string;
  movieId?: string;
  movieTitle?: string;
  theaterId?: string;
  theaterName?: string;
  roomId?: string;
  roomName?: string;
  roomType?: RoomType[];
  status?: BookingStatus[];

  search?: string;
  sort?: SortFields;
  page?: number;
  limit?: number;
  from?: Date;
  to?: Date;
};

type PaginatedQueryByShowtimeCriteria = {
  showtimeId: string;
  userId?: string;
  username?: string;
  status?: BookingStatus[];

  sort?: SortFields;
  page?: number;
  limit?: number;
  from?: Date;
  to?: Date;
};

type PaginatedQueryByUserCriteria = {
  userId: string;

  movieId?: string;
  movieTitle?: string;
  theaterId?: string;
  theaterName?: string;
  roomId?: string;
  roomName?: string;
  roomType?: RoomType[];
  status?: BookingStatus[];

  sort?: SortFields;
  page?: number;
  limit?: number;
  from?: Date;
  to?: Date;
};

/** */
type Seat = {
  seatCode: string;
  seatType: SeatType;
};
type SeatMap = (Seat | null)[][];

type SeatAvailability = Seat & {
  status: BookingSeatStatus;
  isAvailable: boolean;
};
type SeatAvailabilityMap = (SeatAvailability | null)[][];

@Injectable()
export class BookingService {
  public constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly userService: UserService,
    private readonly seatService: SeatService,
    private readonly roomService: RoomService,
    private readonly showtimeService: ShowtimeService,
    private readonly ticketPricingService: PricingConfigService,
  ) {
    //
  }
  /** */
  public async findBookingById(id: string) {
    return this.bookingRepository.query.findOneById({
      id: id,
    });
  }

  /** */
  public async findPaginatedBookings(options: PaginatedQueryCriteria) {
    const { page, limit, sort: rawSort, ...rest } = options;

    const filter = await this.buildBookingFilter(rest);
    const sort = pickSortableFields(rawSort, QUERY_FIELDS.SORTABLE);

    const result = await this.bookingRepository.query.findManyPaginated({
      filter,
      page,
      limit,
      sort,
    });

    return {
      items: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  /** */
  public async findPaginatedBookingsByShowtime(
    options: PaginatedQueryByShowtimeCriteria,
  ) {
    return this.findPaginatedBookings(options);
  }

  /** */
  public async findPaginatedBookingsByUser(
    options: PaginatedQueryByUserCriteria,
  ) {
    return this.findPaginatedBookings(options);
  }

  /** */
  public async getBookingAvailability(showtimeId: string) {
    const showtime = await this.showtimeService.findShowtimeById(showtimeId);
    if (!showtime) throw new NotFoundException('Showtime not found');

    const seatTypePrices = await this.resolveSeatTypePrices(showtime);
    const prices = Object.entries(seatTypePrices).map(([seatType, price]) => ({
      seatType,
      price,
    }));

    const seatMap = await this.roomService.getSeatMapByRoomId(showtime.roomId);
    const bookings = await this.findBlockingBookingsByShowtimeId(showtime._id);
    const availabilitySeatMap = this.buildSeatAvailabilityMap(
      seatMap,
      bookings,
    );

    return {
      seatMap: availabilitySeatMap,
      prices: prices,
    };
  }

  /** */
  public async createBooking(
    showtimeId: string,
    userId: string,
    selectedSeats: string[],
  ) {
    const selectedSet = this.validateAndBuildSelectedSeatSet(selectedSeats);

    const showtime = await this.showtimeService.findShowtimeById(showtimeId);
    if (!showtime) throw new NotFoundException('Showtime not found');

    const user = await this.userService.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const rawSeatMap = await this.roomService.getSeatMapByRoomId(
      showtime.roomId,
    );

    //
    const blockings = await this.findBlockingBookingsByShowtimeId(showtime._id);
    const userActiveBooking = this.findUserActiveBooking(user._id, blockings);
    if (userActiveBooking) {
      throw new ConflictException('User already has an active booking');
    }

    //
    const seatMap = this.buildSeatAvailabilityMap(rawSeatMap, blockings);
    const seatMapIndex = this.buildSeatAvailabilityIndexByCode(seatMap);
    this.validateSeatsAvailability(seatMapIndex, selectedSet);
    this.validateOrphanRule(seatMap, selectedSet);

    //
    const seatTypePrices = await this.resolveSeatTypePrices({
      roomType: showtime.roomType,
      startAt: showtime.startAt,
    });

    const { bookingSeats, baseAmount } = selectedSeats.reduce(
      (acc, seatCode) => {
        const seat = seatMapIndex.get(seatCode);
        if (!seat) {
          throw new BadRequestException(`Seat not found: ${seatCode}`);
        }

        const unitPrice = seatTypePrices[seat.seatType];
        if (unitPrice == null) {
          throw new InternalServerErrorException(
            `Missing price for seat type: ${seat.seatType}`,
          );
        }

        acc.bookingSeats.push({
          seatCode: seat.seatCode,
          seatType: seat.seatType,
          unitPrice,
        });

        acc.baseAmount += unitPrice;
        return acc;
      },
      { bookingSeats: [] as BookingSeat[], baseAmount: 0 },
    );

    const discountAmount = 0; // TODO: membership + voucher
    const finalAmount = baseAmount - discountAmount;

    const expiresAt = DateUtil.add(DateUtil.nowUTC(), {
      minute: BOOKING_EXPIRE_MINUTES.DRAFT,
    });

    try {
      const { insertedItem: created } =
        await this.bookingRepository.command.createOne({
          data: {
            userId: user._id,
            showtimeId: showtime._id,
            status: BOOKING_STATUSES.DRAFT,
            expiresAt: expiresAt,
            seats: bookingSeats,

            baseAmount: baseAmount,
            discountAmount: discountAmount,
            finalAmount: finalAmount,

            // --- TODO ---
            // membershipId
            // membershipDiscountAmount
            // membershipTier

            // voucherId
            // voucherDiscountAmount
            // voucherCode

            // --- Snapshot ---
            username: user.username,
            movieTitle: showtime.movieTitle,
            theaterName: showtime.theaterName,
            roomName: showtime.roomName,
            roomType: showtime.roomType,
            startAt: showtime.startAt,
          },
        });

      return created;
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('Booking create conflict');
      }
      throw new InternalServerErrorException();
    }
  }

  public async markDraftToPendingPayment(id: string) {
    const now = DateUtil.nowUTC();
    const expiresAt = DateUtil.add(now, {
      minute: BOOKING_EXPIRE_MINUTES.PENDING_PAYMENT,
    });

    const { modifiedItem } = await this.bookingRepository.command.updateOne({
      filter: {
        _id: id,
        status: BOOKING_STATUSES.DRAFT,
        expiresAt: { $gt: now },
      },
      update: {
        status: BOOKING_STATUSES.PENDING_PAYMENT,
        expiresAt,
      },
    });

    if (!modifiedItem) {
      throw new ConflictException(
        'Booking is not in DRAFT state or already expired',
      );
    }

    return modifiedItem;
  }

  public async markPendingPaymentToConfirmed(id: string) {
    const { modifiedItem } = await this.bookingRepository.command.updateOne({
      filter: {
        _id: id,
        status: BOOKING_STATUSES.PENDING_PAYMENT,
      },
      update: {
        status: BOOKING_STATUSES.CONFIRMED,
        expiresAt: null,
      },
    });

    if (!modifiedItem) {
      throw new ConflictException('Booking is not in PENDING_PAYMENT state');
    }

    return modifiedItem;
  }

  public async markPendingPaymentToCancelled(id: string) {
    const { modifiedItem } = await this.bookingRepository.command.updateOne({
      filter: {
        _id: id,
        status: BOOKING_STATUSES.PENDING_PAYMENT,
      },
      update: {
        status: BOOKING_STATUSES.CANCELLED,
      },
    });

    if (!modifiedItem) {
      throw new ConflictException('Booking is not in PENDING_PAYMENT state');
    }

    return modifiedItem;
  }

  public async markPendingPaymentToExpired(id: string) {
    const { modifiedItem } = await this.bookingRepository.command.updateOne({
      filter: {
        _id: id,
        status: BOOKING_STATUSES.PENDING_PAYMENT,
      },
      update: {
        status: BOOKING_STATUSES.EXPIRED,
      },
    });

    if (!modifiedItem) {
      throw new ConflictException('Booking is not in PENDING_PAYMENT state');
    }

    return modifiedItem;
  }

  /** */
  private async findBlockingBookingsByShowtimeId(showtimeId: string) {
    const now = DateUtil.nowUTC();
    return this.bookingRepository.query.findMany({
      filter: {
        showtimeId,
        $or: [
          { status: BOOKING_STATUSES.CONFIRMED },
          { status: BOOKING_STATUSES.PENDING_PAYMENT, expiresAt: { $gt: now } },
          { status: BOOKING_STATUSES.DRAFT, expiresAt: { $gt: now } },
          //EXPIRED / CANCELLED = non-blocking
        ],
      },
      inclusion: {
        userId: true,
        status: true,
        seats: true,
      },
    });
  }

  //
  private findUserActiveBooking(
    userId: string,
    blockings: { userId: string; status: BookingStatus }[],
  ) {
    const ACTIVE_STATUSES: BookingStatus[] = [
      BOOKING_STATUSES.DRAFT,
      BOOKING_STATUSES.PENDING_PAYMENT,
    ];

    return blockings.find(
      (b) => b.userId === userId && ACTIVE_STATUSES.includes(b.status),
    );
  }

  // seat type prices
  private async resolveSeatTypePrices(showtime: {
    roomType: RoomType;
    startAt: Date;
  }): Promise<Record<SeatType, number>> {
    const { roomType, startAt } = showtime;
    const prices: Record<SeatType, number> =
      await this.ticketPricingService.getSeatTypePrices({
        roomType: roomType,
        effectiveAt: startAt,
      });

    return prices;
  }

  // build seat map
  private buildSeatAvailabilityMap(
    seatMap: SeatMap,
    bookings: {
      userId: string;
      status: BookingStatus;
      seats: { seatCode: string }[];
    }[],
  ): SeatAvailabilityMap {
    const seatStatusMap = new Map<string, BookingSeatStatus>();

    for (const booking of bookings) {
      let seatStatus: BookingSeatStatus;

      if (booking.status === BOOKING_STATUSES.CONFIRMED) {
        seatStatus = BOOKING_SEAT_STATUSES.SOLD;
      } else {
        // PENDING_PAYMENT hoặc DRAFT còn hạn
        seatStatus = BOOKING_SEAT_STATUSES.RESERVED;
      }

      for (const seat of booking.seats) {
        const existing = seatStatusMap.get(seat.seatCode);
        if (existing === BOOKING_SEAT_STATUSES.SOLD) continue;

        seatStatusMap.set(seat.seatCode, seatStatus);
      }
    }

    return seatMap.map((row) =>
      row.map((seat) => {
        if (!seat) return null;
        const status =
          seatStatusMap.get(seat.seatCode) ?? BOOKING_SEAT_STATUSES.AVAILABLE;

        return {
          seatCode: seat.seatCode,
          seatType: seat.seatType,
          status,
          isAvailable: status === BOOKING_SEAT_STATUSES.AVAILABLE,
        };
      }),
    );
  }

  private buildSeatAvailabilityIndexByCode(
    seatMap: SeatAvailabilityMap,
  ): Map<string, SeatAvailability> {
    return seatMap.reduce((map, row) => {
      row.forEach((seat) => {
        if (seat) map.set(seat.seatCode, seat);
      });
      return map;
    }, new Map<string, SeatAvailability>());
  }

  // check input and build
  private validateAndBuildSelectedSeatSet(selectedSeats: string[]) {
    if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      throw new BadRequestException('No seats selected');
    }

    if (selectedSeats.length > BOOKING_LIMITS.MAX_SEATS_PER_BOOKING) {
      throw new BadRequestException(
        `Maximum ${BOOKING_LIMITS.MAX_SEATS_PER_BOOKING} seats allowed per booking`,
      );
    }

    const seen = new Set<string>();
    for (const seatCode of selectedSeats) {
      if (!this.seatService.isValidSeatCode(seatCode)) {
        throw new BadRequestException(`Invalid seat code: ${seatCode}`);
      }

      if (seen.has(seatCode)) {
        throw new BadRequestException(`Duplicate seat selected: ${seatCode}`);
      }

      seen.add(seatCode);
    }

    return seen;
  }

  // Check orphan
  private validateSeatsAvailability(
    seatMapIndex: Map<string, SeatAvailability>,
    selectedSet: Set<string>,
  ) {
    for (const seatCode of selectedSet) {
      const seat = seatMapIndex.get(seatCode);
      if (!seat) {
        throw new BadRequestException(
          `Invalid seat selection: seat does not exist (${seatCode})`,
        );
      }
      if (!seat.isAvailable) {
        throw new BadRequestException(
          `Invalid seat selection: seat is already booked (${seatCode})`,
        );
      }
    }
  }

  private validateOrphanRule(
    seatMap: SeatAvailabilityMap,
    selectedSet: Set<string>,
  ) {
    for (const row of seatMap) {
      this.validateRow(row, selectedSet);
    }
  }

  private validateRow(
    row: (SeatAvailability | null)[],
    selectedSet: Set<string>,
  ) {
    let segment: SeatAvailability[] = [];
    let leftBoundary: 'HARD' | 'SOFT' = 'SOFT';

    const flush = (rightBoundary: 'HARD' | 'SOFT') => {
      if (segment.length > 0) {
        this.validateSegment(segment, leftBoundary, rightBoundary, selectedSet);
        segment = [];
      }
    };

    for (const seat of row) {
      if (seat === null) {
        flush('SOFT');
        leftBoundary = 'SOFT';
        continue;
      }

      if (!seat.isAvailable || seat.seatType !== 'NORMAL') {
        flush('HARD');
        leftBoundary = 'HARD';
        continue;
      }

      segment.push(seat);
    }

    flush('SOFT');
  }

  private validateSegment(
    segment: SeatAvailability[],
    leftBoundary: 'HARD' | 'SOFT',
    rightBoundary: 'HARD' | 'SOFT',
    selectedSet: Set<string>,
  ) {
    if (segment.length <= 2) return;

    const selectedIndexes = segment
      .map((s, i) => (selectedSet.has(s.seatCode) ? i : -1))
      .filter((i) => i !== -1);

    if (selectedIndexes.length === 0) return;

    // Rule 1: must be consecutive
    for (let i = 1; i < selectedIndexes.length; i++) {
      if (selectedIndexes[i] !== selectedIndexes[i - 1] + 1) {
        throw new BadRequestException(
          'Selected seats must be consecutive within the same segment',
        );
      }
    }

    const first = selectedIndexes[0];
    const last = selectedIndexes[selectedIndexes.length - 1];

    // ===== HARD LEFT =====
    if (leftBoundary === 'HARD') {
      let emptyCount = 0;
      for (let i = 0; i < first; i++) {
        emptyCount++;
      }

      if (emptyCount === 1) {
        throw new BadRequestException(
          `Seat ${segment[0].seatCode} would be left empty next to a hard boundary`,
        );
      }
    }

    // ===== HARD RIGHT =====
    if (rightBoundary === 'HARD') {
      let emptyCount = 0;
      for (let i = segment.length - 1; i > last; i--) {
        emptyCount++;
      }

      if (emptyCount === 1) {
        throw new BadRequestException(
          `Seat ${segment[segment.length - 1].seatCode} would be left empty next to a hard boundary`,
        );
      }
    }
  }

  /** */
  private async buildBookingFilter(options: PaginatedQueryCriteria) {
    const {
      search,
      movieId,
      theaterId,
      roomId,
      from: rawFrom,
      to: rawTo,
      ...rest
    } = options;

    const filter: any = {};

    // Handle indirect filtering via showtimes
    if (movieId || theaterId || roomId) {
      const showtimes = await this.showtimeService.findShowtimes({
        movieId,
        theaterId,
        roomId,
      });

      const showtimeIds = showtimes.map((st) => st._id);

      // If no showtimes found, return empty result
      if (showtimeIds.length === 0) {
        filter.showtimeId = { $in: [] }; // Will match nothing
      } else {
        filter.showtimeId = { $in: showtimeIds };
      }
    }

    // search fields
    if (search) {
      const r = new RegExp(escapeStringRegexp(search), 'i');
      filter.$or = QUERY_FIELDS.SEARCHABLE.map((f) => ({ [f]: r }));
    }

    // regex fields
    QUERY_FIELDS.REGEX_MATCH.forEach((f) => {
      if (rest[f] !== undefined)
        filter[f] = new RegExp(escapeStringRegexp(rest[f]), 'i');
    });

    // Array match fields
    QUERY_FIELDS.ARRAY_MATCH.forEach((f) => {
      if (rest[f]?.length) {
        filter[f] = { $in: rest[f] };
      }
    });

    // Exact match fields
    QUERY_FIELDS.EXACT_MATCH.forEach((f) => {
      if (rest[f] !== undefined) {
        filter[f] = rest[f];
      }
    });

    // Date range filter (createdAt)
    if (rawFrom || rawTo) {
      const startDate = rawFrom ? DateUtil.startOfDay(rawFrom) : undefined;
      const endDate = rawTo ? DateUtil.endOfDay(rawTo) : undefined;

      if (startDate && endDate && startDate > endDate) {
        throw new BadRequestException(
          'Start date must be before or equal to end date',
        );
      }

      filter.createdAt = {
        ...(startDate && { $gte: startDate }),
        ...(endDate && { $lte: endDate }),
      };
    }

    return filter;
  }
}
