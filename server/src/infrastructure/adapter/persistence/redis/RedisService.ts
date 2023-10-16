import { createClient } from "redis";
import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";

export type RedisClient = ReturnType<typeof createClient>;
export const REDIS_CLIENT = Symbol("REDIS_CLIENT");

@Injectable()
export class RedisService implements OnModuleDestroy {
  public constructor(
    @Inject(REDIS_CLIENT) private readonly redis: RedisClient,
  ) {}

  onModuleDestroy() {
    this.redis.quit();
  }
}
