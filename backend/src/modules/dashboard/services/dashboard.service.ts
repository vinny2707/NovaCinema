import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DateUtil } from 'src/common/utils';
import { Movie, MovieDocument } from 'src/modules/movies/schemas';
import { User, UserDocument } from 'src/modules/users/schemas';
import { Payment, PaymentDocument } from 'src/modules/payments/schemas';
import { Booking, BookingDocument } from 'src/modules/bookings/schemas';
import { Theater, TheaterDocument } from 'src/modules/theaters/schemas';
import { PAYMENT_STATUSES } from 'src/modules/payments/constants';
import { BOOKING_STATUSES } from 'src/modules/bookings/constants';

export interface StatItem {
  value: number;
  growth: number;
}

export interface ActivityItem {
  type: 'movie' | 'user' | 'theater' | 'booking';
  title: string;
  description: string;
  createdAt: Date;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Movie.name)
    private readonly movieModel: Model<MovieDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Theater.name)
    private readonly theaterModel: Model<TheaterDocument>,
  ) {}

  /**
   * Get dashboard statistics with month-over-month growth
   */
  async getStatistics(): Promise<{
    totalMovies: StatItem;
    totalUsers: StatItem;
    revenue: StatItem;
    totalBookings: StatItem;
  }> {
    // Date ranges
    const now = DateUtil.now();
    const currentMonthStart = DateUtil.startOfMonth(now);
    const previousMonthStart = DateUtil.startOfMonth(
      DateUtil.add(now, { months: -1 }),
    );
    const previousMonthEnd = DateUtil.endOfMonth(
      DateUtil.add(now, { months: -1 }),
    );

    // --- Total Movies ---
    const [totalMovies, moviesCurrentMonth, moviesPreviousMonth] =
      await Promise.all([
        this.movieModel.countDocuments(),
        this.movieModel.countDocuments({
          createdAt: { $gte: currentMonthStart },
        }),
        this.movieModel.countDocuments({
          createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
        }),
      ]);

    // --- Total Users ---
    const [totalUsers, usersCurrentMonth, usersPreviousMonth] =
      await Promise.all([
        this.userModel.countDocuments(),
        this.userModel.countDocuments({
          createdAt: { $gte: currentMonthStart },
        }),
        this.userModel.countDocuments({
          createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
        }),
      ]);

    // --- Revenue (ONLY from PAID payments) ---
    const [revenueResult, revenueCurrentMonthResult, revenuePreviousMonthResult] =
      await Promise.all([
        this.paymentModel.aggregate([
          { $match: { status: PAYMENT_STATUSES.PAID } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        this.paymentModel.aggregate([
          {
            $match: {
              status: PAYMENT_STATUSES.PAID,
              transactionAt: { $gte: currentMonthStart },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        this.paymentModel.aggregate([
          {
            $match: {
              status: PAYMENT_STATUSES.PAID,
              transactionAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);

    const totalRevenue = revenueResult[0]?.total ?? 0;
    const revenueCurrentMonth = revenueCurrentMonthResult[0]?.total ?? 0;
    const revenuePreviousMonth = revenuePreviousMonthResult[0]?.total ?? 0;

    // --- Total Confirmed Bookings ---
    const [totalBookings, bookingsCurrentMonth, bookingsPreviousMonth] =
      await Promise.all([
        this.bookingModel.countDocuments({
          status: BOOKING_STATUSES.CONFIRMED,
        }),
        this.bookingModel.countDocuments({
          status: BOOKING_STATUSES.CONFIRMED,
          createdAt: { $gte: currentMonthStart },
        }),
        this.bookingModel.countDocuments({
          status: BOOKING_STATUSES.CONFIRMED,
          createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
        }),
      ]);

    return {
      totalMovies: {
        value: totalMovies,
        growth: this.calculateGrowth(moviesCurrentMonth, moviesPreviousMonth),
      },
      totalUsers: {
        value: totalUsers,
        growth: this.calculateGrowth(usersCurrentMonth, usersPreviousMonth),
      },
      revenue: {
        value: totalRevenue,
        growth: this.calculateGrowth(revenueCurrentMonth, revenuePreviousMonth),
      },
      totalBookings: {
        value: totalBookings,
        growth: this.calculateGrowth(bookingsCurrentMonth, bookingsPreviousMonth),
      },
    };
  }

  /**
   * Get recent activity for dashboard
   */
  async getRecentActivity(limit = 10): Promise<ActivityItem[]> {
    const [recentMovies, recentUsers, recentTheaters, recentBookings] =
      await Promise.all([
        this.movieModel
          .find()
          .sort({ createdAt: -1 })
          .limit(limit)
          .select('title createdAt')
          .lean() as Promise<{ title: string; createdAt?: Date }[]>,
        this.userModel
          .find()
          .sort({ createdAt: -1 })
          .limit(limit)
          .select('email username createdAt')
          .lean() as Promise<{ email: string; username?: string; createdAt?: Date }[]>,
        this.theaterModel
          .find()
          .sort({ updatedAt: -1 })
          .limit(limit)
          .select('theaterName updatedAt')
          .lean() as Promise<{ theaterName: string; updatedAt?: Date }[]>,
        this.bookingModel
          .find({ status: BOOKING_STATUSES.CONFIRMED })
          .sort({ createdAt: -1 })
          .limit(limit)
          .select('username movieTitle createdAt')
          .lean() as Promise<{ username?: string; movieTitle?: string; createdAt?: Date }[]>,
      ]);

    const activities: ActivityItem[] = [];

    // Combine all activities
    recentMovies.forEach((movie) => {
      activities.push({
        type: 'movie',
        title: 'Phim mới được thêm',
        description: movie.title,
        createdAt: movie.createdAt ?? new Date(),
      });
    });

    recentUsers.forEach((user) => {
      activities.push({
        type: 'user',
        title: 'Người dùng mới đăng ký',
        description: user.email,
        createdAt: user.createdAt ?? new Date(),
      });
    });

    recentTheaters.forEach((theater) => {
      activities.push({
        type: 'theater',
        title: 'Cập nhật rạp chiếu',
        description: theater.theaterName,
        createdAt: theater.updatedAt ?? new Date(),
      });
    });

    recentBookings.forEach((booking) => {
      activities.push({
        type: 'booking',
        title: 'Đặt vé thành công',
        description: `${booking.username ?? 'Khách'} - ${booking.movieTitle ?? 'N/A'}`,
        createdAt: booking.createdAt ?? new Date(),
      });
    });

    // Sort by date descending and take top items
    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return activities.slice(0, limit);
  }

  /**
   * Calculate growth percentage
   */
  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Get revenue chart data for a date range
   * Aggregates daily revenue from PAID payments
   */
  async getRevenueChart(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    data: { date: string; revenue: number; transactions: number }[];
    totalRevenue: number;
    totalTransactions: number;
  }> {
    // Ensure endDate includes the full day
    const endOfDay = DateUtil.endOfDay(endDate);

    // Aggregate payments by day
    const dailyRevenue = await this.paymentModel.aggregate([
      {
        $match: {
          status: PAYMENT_STATUSES.PAID,
          transactionAt: {
            $gte: startDate,
            $lte: endOfDay,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$transactionAt' },
            month: { $month: '$transactionAt' },
            day: { $dayOfMonth: '$transactionAt' },
          },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1,
        },
      },
    ]);

    // Build a map of date string to data
    const revenueMap = new Map<string, { revenue: number; transactions: number }>();
    dailyRevenue.forEach((item) => {
      const dateStr = `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
      revenueMap.set(dateStr, {
        revenue: item.revenue,
        transactions: item.transactions,
      });
    });

    // Generate all dates in range and fill with data
    const data: { date: string; revenue: number; transactions: number }[] = [];
    let totalRevenue = 0;
    let totalTransactions = 0;

    let currentDate = DateUtil.startOfDay(startDate);
    const endDateDay = DateUtil.startOfDay(endDate);

    while (currentDate <= endDateDay) {
      const dateStr = DateUtil.toDateString(currentDate);
      const dayData = revenueMap.get(dateStr) || { revenue: 0, transactions: 0 };

      data.push({
        date: dateStr,
        revenue: dayData.revenue,
        transactions: dayData.transactions,
      });

      totalRevenue += dayData.revenue;
      totalTransactions += dayData.transactions;

      currentDate = DateUtil.add(currentDate, { days: 1 });
    }

    return {
      data,
      totalRevenue,
      totalTransactions,
    };
  }
}

