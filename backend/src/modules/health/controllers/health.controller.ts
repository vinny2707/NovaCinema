import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Public, WrapOkResponse } from 'src/common/decorators';
import { HealthService } from '../services';
import { HealthResDto } from '../dtos/responses';

@Controller('health')
export class HealthController {
  public constructor(
    //
    private readonly healthService: HealthService,
  ) {
    //
  }

  @ApiOperation({ description: 'Health check' })
  @WrapOkResponse({ dto: HealthResDto })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Get()
  public getHealth() {
    return this.healthService.check();
  }
}
