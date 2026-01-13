import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsIn } from 'class-validator';
import { USER_ROLE_VALUES } from '../../constants';
import { UserRole } from '../../types';

export class ChangeRolesReqDto {
  @ApiProperty({
    description: 'Array of roles to assign to the user',
    example: ['USER', 'ADMIN'],
    enum: USER_ROLE_VALUES,
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(USER_ROLE_VALUES, { each: true })
  roles!: UserRole[];
}
