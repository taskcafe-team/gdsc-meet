import { plainToClass } from "class-transformer";
import { IsNotEmpty, IsNumber, validateSync, IsBoolean } from "class-validator";

export class EnvironmentVariablesConfig {
  // ----- api ----- //
  @IsNotEmpty()
  API_HOST: string;

  @IsNotEmpty()
  @IsNumber()
  API_PORT: number;

  @IsNotEmpty()
  API_ACCESS_TOKEN_SECRET: string;

  @IsNotEmpty()
  @IsNumber()
  API_ACCESS_TOKEN_TTL_IN_MINUTES: number;

  @IsNotEmpty()
  API_ACCESS_TOKEN_HEADER: string;

  @IsNotEmpty()
  API_LOGIN_USERNAME_FIELD: string;

  @IsNotEmpty()
  API_LOGIN_PASSWORD_FIELD: string;

  @IsNotEmpty()
  @IsBoolean()
  API_LOG_ENABLE: boolean;

  @IsNotEmpty()
  API_CORS_ORIGIN: string;

  @IsNotEmpty()
  API_CORS_METHOD: string;

  public static validate(configuration: Record<string, unknown>) {
    const finalConfig = plainToClass(
      EnvironmentVariablesConfig,
      configuration,
      { enableImplicitConversion: true },
    );

    const errors = validateSync(finalConfig, { skipMissingProperties: false });

    if (errors.length > 0) throw new Error(errors.toString());

    return finalConfig;
  }
}
