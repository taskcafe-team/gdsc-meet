import { env } from "process";
import { IsNotEmpty, IsNumber } from "class-validator";
import { BaseConfig } from "./BaseConfig";

export class MailServiceConfig extends BaseConfig {
  @IsNotEmpty() EMAIL_HOST = env.EMAIL_HOST ?? "";
  @IsNotEmpty() @IsNumber() EMAIL_PORT = parseInt(env.EMAIL_PORT ?? "");
  @IsNotEmpty() EMAIL_AUTH_USER = env.EMAIL_AUTH_USER ?? "";
  @IsNotEmpty() EMAIL_AUTH_USER_PASSWORD = env.EMAIL_AUTH_USER_PASSWORD ?? "";
  @IsNotEmpty() EMAIL_VERIFICATION_TOKEN_SECRET =
    env.EMAIL_VERIFICATION_TOKEN_SECRET ?? "";
  @IsNotEmpty()
  @IsNumber()
  EMAIL_VERIFICATION_TOKEN_SECRET_TTL_IN_MINUTES = 3;
  @IsNotEmpty() API_CONFIRM_EMAIL_URL = "http://localhost:3000/confirm-email";
  @IsNotEmpty() API_RESET_PASSWORD_URL = "http://localhost:3000/reset-password";
}
