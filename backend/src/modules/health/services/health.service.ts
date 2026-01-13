import { Injectable } from '@nestjs/common';

type HealthStatus = {
  status: 'ok';
  service: string;
  uptime: number;
};

@Injectable()
export class HealthService {
  check(): HealthStatus {
    return {
      status: 'ok',
      service: 'nova-cinema-backend',
      uptime: process.uptime(),
    };
  }
}
