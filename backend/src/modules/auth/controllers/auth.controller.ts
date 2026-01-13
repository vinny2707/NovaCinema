import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Public,
  WrapCreatedResponse,
  WrapOkResponse,
} from 'src/common/decorators';
import { AuthService } from '../services';
import {
  ForgotPasswordReqDto,
  LoginReqDto,
  RefreshTokenReqDto,
  RegisterReqDto,
  ResendOtpReqDto,
  ResetPasswordReqDto,
  VerifyEmailReqDto,
} from '../dtos/requests';
import { AccessTokenResDto, AuthResDto } from '../dtos/responses';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ description: 'Login' })
  @WrapOkResponse({ dto: AuthResDto, message: 'Logged in successful' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('auth/login')
  public async login(@Body() dto: LoginReqDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @ApiOperation({ description: 'Register' })
  @WrapCreatedResponse({ message: 'Registered successful. Please verify OTP' })
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('auth/register')
  public async register(@Body() dto: RegisterReqDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ description: 'Verify email' })
  @WrapOkResponse({ message: 'Email verified successful' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('auth/email/verify')
  public async verify(@Body() dto: VerifyEmailReqDto) {
    return this.authService.verifyEmail(dto.email, dto.otp);
  }

  @ApiOperation({ description: 'Refresh token' })
  @WrapOkResponse({
    dto: AccessTokenResDto,
    message: 'Token refreshed successfully',
  })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('auth/refresh-token')
  public async refreshToken(@Body() dto: RefreshTokenReqDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @ApiOperation({ description: 'Resend otp' })
  @WrapOkResponse({ message: 'OTP resent successfully' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('auth/otp/resend')
  public async resendEmailOtp(@Body() dto: ResendOtpReqDto) {
    return this.authService.resendOtp(dto.email);
  }

  @ApiOperation({ description: 'Forgot password - send OTP to email' })
  @WrapOkResponse({ message: 'OTP sent to your email' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('auth/forgot-password')
  public async forgotPassword(@Body() dto: ForgotPasswordReqDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @ApiOperation({ description: 'Reset password - verify OTP and set new password' })
  @WrapOkResponse({ message: 'Password reset successfully' })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('auth/reset-password')
  public async resetPassword(@Body() dto: ResetPasswordReqDto) {
    return this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
  }
}

