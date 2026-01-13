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
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import {
  Public,
  RequireRoles,
  WrapListResponse,
  WrapNoContentResponse,
  WrapOkResponse,
  WrapPaginatedResponse,
} from 'src/common/decorators';
import { USER_ROLES } from 'src/modules/users/constants';
import { TheaterService } from '../services/theater.service';
import {
  CreateTheaterReqDto,
  PaginatedQueryTheatersReqDto,
  QueryTheatersReqDto,
  UpdateTheaterReqDto,
} from '../dtos/requests';
import { TheaterResDto } from '../dtos/responses';

@ApiTags('Theaters')
@Controller()
export class TheatersController {
  constructor(private readonly theaterService: TheaterService) {}

  @ApiOperation({ description: 'Query theaters' })
  @WrapPaginatedResponse({ dto: TheaterResDto })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('theaters')
  public async paginatedQueryTheaters(
    @Query() query: PaginatedQueryTheatersReqDto,
  ) {
    return this.theaterService.findTheatersPaginated(query);
  }

  @ApiOperation({ description: 'Query all theaters' })
  @WrapListResponse({ dto: TheaterResDto })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('theaters/list')
  public async queryTheaters(@Query() query: QueryTheatersReqDto) {
    return this.theaterService.findTheaters(query);
  }

  @ApiOperation({ description: 'Get theater by ID' })
  @WrapOkResponse({ dto: TheaterResDto })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('theaters:id')
  public async getById(@Param('id', ParseObjectIdPipe) id: string) {
    const existed = await this.theaterService.findTheaterById(id);
    if (!existed) throw new NotFoundException('Theater not found');
    return existed;
  }

  @ApiOperation({ description: 'Create new theater' })
  @WrapOkResponse({ dto: TheaterResDto, message: 'Created successfully' })
  @RequireRoles(USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post('theaters')
  public async createTheater(@Body() dto: CreateTheaterReqDto) {
    return this.theaterService.createTheater(dto);
  }

  @ApiOperation({ description: 'Update theater' })
  @WrapOkResponse({ dto: TheaterResDto, message: 'Updated successfully' })
  @RequireRoles(USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch('theaters/:id')
  public async updateTheater(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateTheaterReqDto,
  ) {
    return this.theaterService.updateTheaterById(id, dto);
  }

  @ApiOperation({ description: 'Hard delete theater' })
  @WrapNoContentResponse({ message: 'Deleted successfully' })
  @RequireRoles(USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('theaters/:id')
  public async deleteTheater(@Param('id', ParseObjectIdPipe) id: string) {
    await this.theaterService.deleteTheaterById(id);
  }
}
