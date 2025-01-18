import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redis: Redis;
  constructor(private readonly configService: ConfigService) {
    const REDIS_URI = this.configService.get<string>('REDIS_URI');

    this.redis = new Redis(REDIS_URI);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, value, 'EX', ttl);
    } else {
      await this.redis.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async mget(...keys: string[]): Promise<string[] | null> {
    return await this.redis.mget(keys);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
