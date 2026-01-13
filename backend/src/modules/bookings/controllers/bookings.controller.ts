import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import {
  CurrentUser,
  Public,
  RequireRoles,
  WrapOkResponse,
  WrapPaginatedResponse,
} from 'src/common/decorators';
import { USER_ROLES } from 'src/modules/users/constants';
import { JwtPayload } from 'src/modules/auth/types';
import { BookingService } from '../services';
import {
  CreateBookingReqDto,
  PaginatedQueryBookingsReqDto,
  PaginatedQueryBookingsByShowtimeReqDto,
  PaginatedQueryBookingsByUserReqDto,
} from '../dtos/requests';
import {
  //,
  BookingAvailabilityResDto,
  BookingResDto,
} from '../dtos/responses';

@ApiTags('Bookings')
@Controller()
export class BookingsController {
  public constructor(
    //
    private readonly bookingService: BookingService,
  ) {
    //
  }

  @ApiOperation({
    description: 'Retrieve booking details by booking ID',
  })
  @WrapOkResponse({ dto: BookingResDto })
  @HttpCode(HttpStatus.OK)
  @Get('bookings/:bookingId')
  public async getBooking(
    @Param('bookingId', ParseObjectIdPipe) bookingId: string,
  ) {
    const booking = await this.bookingService.findBookingById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  @ApiOperation({
    description: 'Get seat availability and pricing for a showtime',
  })
  @WrapOkResponse({ dto: BookingAvailabilityResDto })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('showtimes/:showtimeId/bookings/availability')
  public async getBookingAvailability(
    @Param('showtimeId', ParseObjectIdPipe) showtimeId: string,
  ) {
    return await this.bookingService.getBookingAvailability(showtimeId);
  }

  @ApiOperation({
    description: 'Create a draft booking for a showtime',
  })
  @WrapOkResponse({ dto: BookingResDto })
  @RequireRoles(USER_ROLES.USER)
  @HttpCode(HttpStatus.OK)
  @Post('showtimes/:showtimeId/bookings')
  public async createBooking(
    @Param('showtimeId', ParseObjectIdPipe) showtimeId: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateBookingReqDto,
  ) {
    return await this.bookingService.createBooking(
      showtimeId,
      user.sub,
      body.selectedSeats,
    );
  }

  @ApiOperation({
    description: 'Get paginated list of all bookings (admin only)',
  })
  @WrapPaginatedResponse({ dto: BookingResDto })
  @Public()
  @RequireRoles(USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get('bookings')
  public async getBookingsPaginated(
    @Query() query: PaginatedQueryBookingsReqDto,
  ) {
    return await this.bookingService.findPaginatedBookings(query);
  }

  @ApiOperation({
    description: 'Get paginated bookings for a specific showtime',
  })
  @WrapPaginatedResponse({ dto: BookingResDto })
  @Public()
  @RequireRoles(USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get('showtimes/:showtimeId/bookings')
  public async getBookingsByShowtimePaginated(
    @Param('showtimeId', ParseObjectIdPipe) showtimeId: string,
    @Query() query: PaginatedQueryBookingsByShowtimeReqDto,
  ) {
    return await this.bookingService.findPaginatedBookingsByShowtime({
      showtimeId,
      ...query,
    });
  }

  @ApiOperation({
    description: 'Get paginated bookings of the current user',
  })
  @WrapPaginatedResponse({ dto: BookingResDto })
  @RequireRoles(USER_ROLES.USER)
  @HttpCode(HttpStatus.OK)
  @Get('users/me/bookings')
  public async getCurrentUserBookingsPaginated(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginatedQueryBookingsByUserReqDto,
  ) {
    return await this.bookingService.findPaginatedBookingsByUser({
      userId: user.sub,
      ...query,
    });
  }
}
