import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { refreshTokenOptions } from 'src/config';
import { OtpService } from 'src/modules/notifications';
import { UserService } from 'src/modules/users';
import { UserRole } from 'src/modules/users/types';
import { JwtPayload } from '../types';

@Injectable()
export class AuthService {
  private readonly accessExpiresIn: number;
  private readonly refreshExpiresIn: number;

  constructor(
    private readonly cfgService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly userService: UserService,
  ) {
    this.accessExpiresIn = Number(
      this.cfgService.getOrThrow('JWT_ACCESS_EXPIRES'),
    );
    this.refreshExpiresIn = Number(
      this.cfgService.getOrThrow('JWT_REFRESH_EXPIRES'),
    );
  }

  /** */
  public async login(email: string, password: string) {
    const user = await this.userService.verifyCredential(email, password);
    if (!user.emailVerified)
      throw new ForbiddenException('Email is not verified');

    const loggedInUser = await this.userService.updateUserLastLoginById(
      user._id,
    );

    const accessToken = this.signAccessToken(loggedInUser);
    const refreshToken = this.signRefreshToken(loggedInUser);

    return {
      user: loggedInUser,
      accessToken: accessToken,
      expiresIn: this.accessExpiresIn,
      refreshToken: refreshToken,
      refreshExpiresIn: this.refreshExpiresIn,
    };
  }

  private signAccessToken(user: {
    _id: string;
    email: string;
    roles: UserRole[];
  }) {
    const payload: JwtPayload = {
      sub: user._id,
      email: user.email,
      roles: user.roles,
    };
    return this.jwtService.sign(payload);
  }

  private signRefreshToken(user: { _id: string }) {
    return this.jwtService.sign(
      { sub: user._id },
      refreshTokenOptions(this.cfgService),
    );
  }

  /** */
  public async register(payload: {
    email: string;
    password: string;
    username?: string;
    fullName?: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
  }) {
    const { email } = await this.userService.registerUser(payload);

    await this.otpService.send(email);
    return true;
  }

  /** */
  public async refreshToken(refreshToken: string) {
    if (!refreshToken)
      throw new BadRequestException('Refresh token is required');

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.cfgService.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userId = payload.sub;
    if (!userId) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.userService.findUserById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    return {
      accessToken: this.signAccessToken(user),
      expiresIn: this.accessExpiresIn,
    };
  }

  /** */
  public async verifyEmail(email: string, otp: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new BadRequestException('User not found');
    if (user.emailVerified)
      throw new BadRequestException('Email already verified');

    await this.otpService.verify(user.email, otp);
    await this.userService.verifyUserEmailById(user._id);

    return true;
  }

  /** */
  public async resendOtp(email: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new BadRequestException('User not found');
    if (user.emailVerified)
      throw new BadRequestException('Email already verified');

    await this.otpService.send(user.email);
    return true;
  }

  /** Forgot password - send OTP to email */
  public async forgotPassword(email: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    await this.otpService.send(user.email);
    return true;
  }

  /** Reset password - verify OTP and set new password */
  public async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    await this.otpService.verify(user.email, otp);
    await this.userService.resetPasswordByEmail(user.email, newPassword);

    return true;
  }
}
