import { FactoryProvider, Module } from "@nestjs/common";
import { REDIS_CLIENT, RedisClient } from "./RedisService";
import { createClient } from "redis";

export const redisClientFactory: FactoryProvider<RedisClient> = {
  provide: REDIS_CLIENT,
  useFactory: async () => {
    const client = createClient({
      url: "redis://default:mypass@localhost:6379",
    });
    await client.connect();
    return client;
  },
};

@Module({ providers: [redisClientFactory], exports: [redisClientFactory] })
export class RedisModule {}
