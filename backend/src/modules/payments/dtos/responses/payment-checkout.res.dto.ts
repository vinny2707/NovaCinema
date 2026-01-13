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

  @ApiProperty({ example: '970422', description: 'Bank BIN code' })
  @Expose()
  bin?: string;

  @ApiProperty({ example: '09831340840', description: 'Bank account number' })
  @Expose()
  accountNumber?: string;

  @ApiProperty({ example: 'CONG TY CP PAYOS', description: 'Bank account name' })
  @Expose()
  accountName?: string;

  @ApiProperty({ example: 'CSQ004R6DX9 Booking 11001016803829', description: 'Full transfer content for manual bank transfer' })
  @Expose()
  transferContent?: string;
}
