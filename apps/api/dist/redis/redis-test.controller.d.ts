import { RedisService } from './redis.service';
export declare class RedisTestController {
    private readonly redis;
    constructor(redis: RedisService);
    check(): Promise<{
        ok: boolean;
        value: string | null;
    }>;
}
