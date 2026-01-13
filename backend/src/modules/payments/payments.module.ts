import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/modules/users';
import { BookingsModule } from 'src/modules/bookings';
import { TicketsModule } from 'src/modules/tickets';
import { NotificationsModule } from 'src/modules/notifications';
import { PaymentService, PayosService } from './services';
import { PaymentsController } from './controllers';
import {
  PaymentRepository,
  PaymentCommandRepository,
  PaymentQueryRepository,
} from './repositories';
import { Payment, PaymentSchema } from './schemas';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      //
      { name: Payment.name, schema: PaymentSchema },
    ]),
    UsersModule,
    TicketsModule,
    BookingsModule,
    NotificationsModule,
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentCommandRepository,
    PaymentQueryRepository,
    PaymentRepository,

    PaymentService,
    PayosService,
  ],
  exports: [PaymentService],
})
export class PaymentsModule {}
