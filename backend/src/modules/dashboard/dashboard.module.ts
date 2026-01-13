import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Movie, MovieSchema } from 'src/modules/movies/schemas';
import { User, UserSchema } from 'src/modules/users/schemas';
import { Payment, PaymentSchema } from 'src/modules/payments/schemas';
import { Booking, BookingSchema } from 'src/modules/bookings/schemas';
import { Theater, TheaterSchema } from 'src/modules/theaters/schemas';
import { DashboardService } from './services';
import { AdminDashboardController } from './controllers';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Movie.name, schema: MovieSchema },
      { name: User.name, schema: UserSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Theater.name, schema: TheaterSchema },
    ]),
  ],
  controllers: [AdminDashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
