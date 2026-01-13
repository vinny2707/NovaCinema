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
  WrapCreatedResponse,
  WrapNoContentResponse,
  WrapOkResponse,
  WrapPaginatedResponse,
} from 'src/common/decorators';
import { USER_ROLES } from 'src/modules/users/constants';
import { MovieService } from '../services';
import {
  PaginatedQueryRangeMoviesReqDto,
  PaginatedQueryMoviesReqDto,
  CreateMovieReqDto,
  UpdateMovieReqDto,
} from '../dtos/requests';
import { MovieResDto } from '../dtos/responses';

@ApiTags('Movies')
@Controller()
export class MoviesController {
  constructor(private readonly movieService: MovieService) {}

  @ApiOperation({ description: 'Query movies' })
  @WrapPaginatedResponse({ dto: MovieResDto })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('movies')
  public async getMovies(@Query() query: PaginatedQueryRangeMoviesReqDto) {
    return this.movieService.findMoviesPaginated(query);
  }

  @ApiOperation({ description: 'Query showing movies' })
  @WrapPaginatedResponse({ dto: MovieResDto })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('movies/showing')
  public async getShowingMovies(@Query() query: PaginatedQueryMoviesReqDto) {
    return this.movieService.findShowingMoviesPaginated(query);
  }

  @ApiOperation({ description: 'Query upcoming movies' })
  @WrapPaginatedResponse({ dto: MovieResDto })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('movies/upcoming')
  public async getUpcomingMovies(@Query() query: PaginatedQueryMoviesReqDto) {
    return this.movieService.findUpcomingMoviesPaginated(query);
  }

  @ApiOperation({ description: 'Get movie by ID' })
  @WrapOkResponse({ dto: MovieResDto })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('movies/:id')
  public async getMovieById(@Param('id', ParseObjectIdPipe) id: string) {
    const existed = await this.movieService.findMovieById(id);
    if (!existed) throw new NotFoundException('Movie not found');
    return existed;
  }

  @ApiOperation({ description: 'Create new movie' })
  @WrapCreatedResponse({
    dto: MovieResDto,
    message: 'Movie created successfully',
  })
  @RequireRoles(USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post('movies')
  public async createMovie(@Body() dto: CreateMovieReqDto) {
    return this.movieService.createMovie(dto);
  }

  @ApiOperation({ description: 'Update movie by ID' })
  @WrapOkResponse({
    dto: MovieResDto,
    message: 'Movie updated successfully',
  })
  @RequireRoles(USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch('movies/:id')
  public async updateMovie(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateMovieReqDto,
  ) {
    return this.movieService.updateMovieById(id, dto);
  }

  @ApiOperation({ description: 'Hard delete movie' })
  @WrapNoContentResponse({ message: 'Movie deleted successfully' })
  @RequireRoles(USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('movies/:id')
  public async deleteMovie(@Param('id', ParseObjectIdPipe) id: string) {
    return this.movieService.deleteMovieById(id);
  }
}
