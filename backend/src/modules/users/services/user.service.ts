import escapeStringRegexp from 'escape-string-regexp';
import { FilterQuery } from 'mongoose';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SortFields } from 'src/common/types';
import { DateUtil, HashUtil } from 'src/common/utils';
import { pickSortableFields } from 'src/common/helpers';
import { USER_ROLES } from '../constants';
import { UserDocument } from '../schemas';
import { UserRepository } from '../repositories';
import { UserRole } from '../types';

const QUERY_FIELDS = {
  SEARCHABLE: ['username', 'fullName', 'email'],
  REGEX_MATCH: ['username', 'fullName', 'email'],
  ARRAY_MATCH: ['roles'],
  EXACT_MATCH: ['isActive', 'phoneNumber'],
  SORTABLE: ['username', 'email', 'fullName', 'createdAt', 'lastLoginAt'],
} as const;

type Filter = {
  email?: string;
  phoneNumber?: string;
  username?: string;
  fullName?: string;
  roles?: UserRole[];
  isActive?: boolean;
};

type Query = Filter & {
  search?: string;
  sort?: SortFields;
};

type PaginatedQuery = Query & {
  page?: number;
  limit?: number;
};

type Create = {
  email: string;
  password: string;
  username?: string;
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
};

type Update = {
  username?: string;
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
};

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  public async verifyCredential(email: string, plainPassword: string) {
    const existingUser = await this.userRepo.query.findOneByEmail({ email });
    if (!existingUser)
      throw new UnauthorizedException('Email is not registered');

    const isMatch = await HashUtil.compare(
      plainPassword,
      existingUser.password,
    );
    if (!isMatch) throw new UnauthorizedException('Incorrect password');

    return this.stripPassword(existingUser);
  }

  public async verifyUserEmailById(id: string) {
    const { modifiedItem: updatedUser } =
      await this.userRepo.command.updateOneById({
        id,
        update: { emailVerified: true },
      });

    if (!updatedUser) throw new NotFoundException('User not found');
    return this.stripPassword(updatedUser);
  }

  public async findUserById(id: string) {
    return this.userRepo.query.findOneById({
      id,
      exclusion: { password: false },
    });
  }

  public async findUserByEmail(email: string) {
    return this.userRepo.query.findOneByEmail({
      email: email,
      exclusion: { password: false },
    });
  }

  public async findUsersPaginated(options: PaginatedQuery) {
    const { search, page, limit, sort, ...rest } = options;
    const filter: FilterQuery<UserDocument> = {};

    // search fields
    if (search) {
      const r = new RegExp(escapeStringRegexp(search), 'i');
      filter.$or = QUERY_FIELDS.SEARCHABLE.map((f) => ({ [f]: r }));
    }

    // regex fields
    QUERY_FIELDS.REGEX_MATCH.forEach((f) => {
      if (rest[f] !== undefined)
        filter[f] = new RegExp(escapeStringRegexp(rest[f]), 'i');
    });

    // array fields
    QUERY_FIELDS.ARRAY_MATCH.forEach((f) => {
      if (rest[f]?.length) filter[f] = { $in: rest[f] };
    });

    // exact match fields
    QUERY_FIELDS.EXACT_MATCH.forEach((f) => {
      if (rest[f] !== undefined) filter[f] = rest[f];
    });

    // safe sort
    const safeSort = pickSortableFields(options.sort, QUERY_FIELDS.SORTABLE);

    //
    const result = await this.userRepo.query.findManyPaginated({
      filter,
      page,
      limit,
      sort: safeSort,
      exclusion: { password: false },
    });

    return {
      items: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  /** */
  public async registerUser(data: Create) {
    const {
      email,
      password,
      username,
      fullName,
      phoneNumber,
      dateOfBirth: rawDate,
    } = data;
    const exists = await this.userRepo.query.exists({
      filter: { email },
    });
    if (exists) throw new BadRequestException('Email already exists');

    const dateOfBirth = rawDate ? DateUtil.startOfDay(rawDate) : rawDate;

    const hashedPassword = await HashUtil.hash(password);
    const { insertedItem: createdUser } = await this.userRepo.command.createOne(
      {
        data: {
          email: email,
          password: hashedPassword,
          username: username,
          phoneNumber: phoneNumber,
          fullName: fullName,
          dateOfBirth: dateOfBirth,
          emailVerified: false,
          roles: [USER_ROLES.USER],
        },
      },
    );

    if (!createdUser)
      throw new InternalServerErrorException('Registration failed');

    return this.stripPassword(createdUser);
  }

  /** */
  public async updateUserInfoById(id: string, update: Update) {
    const { modifiedItem: updatedUser } =
      await this.userRepo.command.updateOneById({
        id,
        update,
      });

    if (!updatedUser) throw new NotFoundException('User not found');
    return this.stripPassword(updatedUser);
  }

  public async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ) {
    if (currentPassword === newPassword)
      throw new BadRequestException(
        'New password must be different from current password',
      );

    const user = await this.userRepo.query.findOneById({ id });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await HashUtil.compare(currentPassword, user.password);
    if (!isMatch) throw new ForbiddenException('Current password is incorrect');

    const hashed = await HashUtil.hash(newPassword);
    const { modifiedItem: updatedUser } =
      await this.userRepo.command.updateOneById({
        id,
        update: { password: hashed },
      });

    if (!updatedUser) throw new NotFoundException('User not found');
    return this.stripPassword(updatedUser);
  }

  public async updateUserLastLoginById(id: string) {
    const now = new Date();
    const { modifiedItem: updatedUser } =
      await this.userRepo.command.updateOneById({
        id: id,
        update: {
          lastLoginAt: now,
        },
      });

    if (!updatedUser) throw new NotFoundException('User not found');
    return this.stripPassword(updatedUser);
  }

  private async updateUserStatusById(id: string, active: boolean) {
    const { modifiedItem: updatedUser } =
      await this.userRepo.command.updateOneById({
        id,
        update: { isActive: active },
      });

    if (!updatedUser) throw new NotFoundException('User not found');
    return this.stripPassword(updatedUser);
  }

  public async activateUserById(id: string) {
    return this.updateUserStatusById(id, true);
  }

  public async deactivateUserById(id: string) {
    return this.updateUserStatusById(id, false);
  }

  public async changeUserRolesById(id: string, roles: UserRole[]) {
    const { modifiedItem: updatedUser } =
      await this.userRepo.command.updateOneById({
        id,
        update: { roles },
      });

    if (!updatedUser) throw new NotFoundException('User not found');
    return this.stripPassword(updatedUser);
  }

  /** */
  public async deleteUserById(id: string) {
    const exists = await this.userRepo.query.exists({
      filter: { _id: id },
    });
    if (!exists) throw new NotFoundException('User not found');

    const result = await this.userRepo.command.deleteOneById({ id });
    if (!result.deletedCount)
      throw new InternalServerErrorException('Deletion failed');
  }

  /** Reset password by email (for forgot password flow) */
  public async resetPasswordByEmail(email: string, newPassword: string) {
    const user = await this.userRepo.query.findOneByEmail({ email });
    if (!user) throw new NotFoundException('User not found');

    const hashed = await HashUtil.hash(newPassword);
    const { modifiedItem: updatedUser } =
      await this.userRepo.command.updateOneById({
        id: user._id.toString(),
        update: { password: hashed },
      });

    if (!updatedUser) throw new NotFoundException('User not found');
    return this.stripPassword(updatedUser);
  }

  /** */
  private stripPassword<T extends { password?: string }>(user: T) {
    const { password: _, ...userSafe } = user;
    return userSafe;
  }
}
