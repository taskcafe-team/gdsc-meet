import { IsNotEmpty } from "class-validator";
import { env } from "process";

import { BaseConfig } from "./BaseConfig";

export class RedisConfig extends BaseConfig {
  @IsNotEmpty() REDIS_HOST = env.REDIS_HOST ?? "";
  @IsNotEmpty() REDIS_PORT = parseInt(env.REDIS_PORT ?? "");
  @IsNotEmpty() REDIS_PASS = env.REDIS_PASS ?? "";
}
