import { Controller, Get } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis-test')
export class RedisTestController {
  constructor(private readonly redis: RedisService) {}

  @Get('check')
  async check() {
    await this.redis.set('hello', 'world', 60);
    const value = await this.redis.get('hello');

    return { ok: true, value };
  }
}
