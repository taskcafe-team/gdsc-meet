import { env } from "process";
import { IsNotEmpty } from "class-validator";
import { BaseConfig } from "./BaseConfig";

export class GoogleServiceConfig extends BaseConfig {
  @IsNotEmpty() GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID ?? "";
  @IsNotEmpty() GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET ?? "";
  @IsNotEmpty() GOOGLE_CALLBACK_URL = env.GOOGLE_CALLBACK_URL ?? "";
}
