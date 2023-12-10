import { IsNotEmpty, IsNumber, IsBoolean } from "class-validator";
import { env } from "process";

import { BaseConfig } from "./BaseConfig";

export class AppConfig extends BaseConfig {
  @IsNotEmpty() NODE_ENV = env.NODE_ENV ?? "";
  @IsNotEmpty() API_HOST = env.API_HOST ?? "";
  @IsNotEmpty() @IsNumber() API_PORT = parseInt(env.API_PORT ?? "5000");
  @IsNotEmpty() API_REFRESH_TOKEN_SECRET = env.API_REFRESH_TOKEN_SECRET ?? "";
  @IsNotEmpty() @IsNumber() API_REFRESH_TOKEN_TTL_IN_MINUTES = 87660;
  @IsNotEmpty() API_ACCESS_TOKEN_SECRET = env.API_ACCESS_TOKEN_SECRET ?? "";
  @IsNotEmpty() @IsNumber() API_ACCESS_TOKEN_TTL_IN_MINUTES = 30;
  @IsNotEmpty() API_ACCESS_TOKEN_HEADER = "x-api-token";
  @IsNotEmpty() API_LOGIN_USERNAME_FIELD = "email";
  @IsNotEmpty() API_LOGIN_PASSWORD_FIELD = "password";
  @IsNotEmpty() @IsBoolean() API_LOG_ENABLE = true;
  @IsNotEmpty() API_CORS_ORIGIN = env.API_CORS_ORIGIN ?? "";
  @IsNotEmpty() API_CORS_METHOD = env.API_CORS_METHOD ?? "";
}
