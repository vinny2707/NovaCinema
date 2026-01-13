import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import {
  CurrentUser,
  WrapOkResponse,
  WrapPaginatedResponse,
  RequireRoles,
  WrapNoContentResponse,
} from 'src/common/decorators';
import { JwtPayload } from 'src/modules/auth/types';
import { USER_ROLES } from '../constants';
import { UserService } from '../services';
import {
  ChangePasswordReqDto,
  ChangeRolesReqDto,
  PaginatedQueryUsersReqDto,
  UpdateProfileReqDto,
} from '../dtos/requests';
import { UserResDto } from '../dtos/responses';

@ApiTags('Users')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ description: 'Get me' })
  @WrapOkResponse({ dto: UserResDto })
  @HttpCode(HttpStatus.OK)
  @Get('users/me')
  public async getMe(@CurrentUser() user: JwtPayload) {
    const existed = await this.userService.findUserById(user.sub);
    if (!existed) throw new NotFoundException('User not found');
    return existed;
  }

  @ApiOperation({ description: 'Update me' })
  @WrapOkResponse({ dto: UserResDto })
  @HttpCode(HttpStatus.OK)
  @Patch('users/me')
  public async updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileReqDto,
  ) {
    return await this.userService.updateUserInfoById(user.sub, dto);
  }

  @ApiOperation({ description: 'Change password' })
  @WrapOkResponse({ dto: UserResDto })
  @HttpCode(HttpStatus.OK)
  @Patch('users/change-password')
  public async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordReqDto,
  ) {
    return await this.userService.changePassword(
      user.sub,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @ApiOperation({ description: 'Query users' })
  @WrapPaginatedResponse({ dto: UserResDto })
  @RequireRoles(USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get('users')
  public async getUsers(@Query() query: PaginatedQueryUsersReqDto) {
    return await this.userService.findUsersPaginated(query);
  }

  @ApiOperation({ description: 'Activate user' })
  @WrapOkResponse({ dto: UserResDto, message: 'Activated successful' })
  @RequireRoles(USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch('users/:id/activate')
  public async activateUser(@Param('id', ParseObjectIdPipe) id: string) {
    return await this.userService.activateUserById(id);
  }

  @ApiOperation({ description: 'Deactivate user' })
  @WrapOkResponse({ dto: UserResDto, message: 'Deactivated successful' })
  @RequireRoles(USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch('users/:id/deactivate')
  public async deactivateUser(@Param('id', ParseObjectIdPipe) id: string) {
    return await this.userService.deactivateUserById(id);
  }

  @ApiOperation({ description: 'Hard delete user' })
  @WrapNoContentResponse({ message: 'Deleted successfully' })
  @RequireRoles(USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('users/:id')
  public async deleteUser(@Param('id', ParseObjectIdPipe) id: string) {
    return await this.userService.deleteUserById(id);
  }

  @ApiOperation({ description: 'Change user roles (Super Admin only)' })
  @WrapOkResponse({ dto: UserResDto, message: 'Roles updated successfully' })
  @RequireRoles(USER_ROLES.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch('users/:id/roles')
  public async changeUserRoles(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: ChangeRolesReqDto,
  ) {
    return await this.userService.changeUserRolesById(id, dto.roles);
  }
}
