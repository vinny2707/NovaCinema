import { BadRequestException, Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequireRoles, WrapOkResponse } from 'src/common/decorators';
import { USER_ROLES } from 'src/modules/users/constants';
import { DashboardService } from '../services';
import { DashboardStatsResDto, RecentActivityResDto, RevenueChartResDto } from '../dtos';

@ApiTags('Dashboard')
@Controller('dashboard')
export class AdminDashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ description: 'Get dashboard statistics' })
  @WrapOkResponse({ dto: DashboardStatsResDto })
  @RequireRoles(USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get('statistics')
  public async getStatistics() {
    return await this.dashboardService.getStatistics();
  }

  @ApiOperation({ description: 'Get recent activity' })
  @WrapOkResponse({ dto: RecentActivityResDto })
  @RequireRoles(USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get('recent-activity')
  public async getRecentActivity(@Query('limit') limit?: string) {
    const activities = await this.dashboardService.getRecentActivity(
      limit ? parseInt(limit, 10) : 10,
    );
    return { activities };
  }

  @ApiOperation({ description: 'Get revenue chart data for a date range' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date (YYYY-MM-DD)' })
  @WrapOkResponse({ dto: RevenueChartResDto })
  @RequireRoles(USER_ROLES.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get('revenue-chart')
  public async getRevenueChart(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    if (start > end) {
      throw new BadRequestException('startDate must be before or equal to endDate');
    }

    return await this.dashboardService.getRevenueChart(start, end);
  }
}

