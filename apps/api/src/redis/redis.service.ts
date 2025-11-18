import { Injectable } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService {
  public redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  async set(key: string, value: any, ttlSeconds?: number) {
    if (ttlSeconds) {
      return this.redis.set(key, value, { ex: ttlSeconds });
    }
    return this.redis.set(key, value);
  }

  async get<T = any>(key: string): Promise<T | null> {
    return this.redis.get(key) as T;
  }

  async del(key: string) {
    return this.redis.del(key);
  }
}
