// src/redis/redis.service.ts
import { Injectable } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        'UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not configured',
      );
    }

    this.client = new Redis({
      url,
      token,
    });
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, { ex: ttlSeconds });
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    const value = await this.client.get<string | null>(key);
    return value ?? null;
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
