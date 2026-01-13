import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PaymentResDto } from './payment.res.dto';

export class PaymentCheckoutResDto extends PaymentResDto {
  @ApiProperty({
    example: 'https://pay.payos.vn/web/b3ee90dc9593471c935a6ae691a456c4',
  })
  @Expose()
  checkoutUrl!: string;

  @ApiProperty({
    example:
      '00020101021238540010A00000072701240006970422011009831340840208QRIBFTTA5303704540450005802VN62380834CSJLZ3IMCD9 Booking 9207565539425963045CEF',
  })
  @Expose()
  qrCode!: string;
}
