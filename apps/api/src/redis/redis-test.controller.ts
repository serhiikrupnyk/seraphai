// src/redis/redis-test.controller.ts
import { Controller, Get } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis-test')
export class RedisTestController {
  constructor(private readonly redis: RedisService) {}

  @Get('check')
  async check() {
    const key = 'seraphai:redis:test';

    await this.redis.set(key, 'world', 60);
    const value = await this.redis.get(key);

    return {
      ok: true,
      value,
    };
  }
}
