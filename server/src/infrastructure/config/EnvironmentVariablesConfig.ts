import { plainToClass } from "class-transformer";
import { IsNotEmpty, IsNumber, validateSync, IsBoolean } from "class-validator";

// class này là bao gồm các quy tắc biến môi trường phải tuân thủ
export class EnvironmentVariablesConfig {
  @IsNotEmpty() NODE_ENV: string;
  // ----- api ----- //
  @IsNotEmpty() API_HOST: string;
  @IsNotEmpty() @IsNumber() API_PORT: number;
  @IsNotEmpty() API_REFRESH_TOKEN_SECRET: string;
  @IsNotEmpty() @IsNumber() API_REFRESH_TOKEN_TTL_IN_MINUTES: number;
  @IsNotEmpty() API_ACCESS_TOKEN_SECRET: string;
  @IsNotEmpty() @IsNumber() API_ACCESS_TOKEN_TTL_IN_MINUTES: number;
  @IsNotEmpty() API_ACCESS_TOKEN_HEADER: string;
  @IsNotEmpty() API_LOGIN_USERNAME_FIELD: string;
  @IsNotEmpty() API_LOGIN_PASSWORD_FIELD: string;
  @IsNotEmpty() @IsBoolean() API_LOG_ENABLE: boolean;
  @IsNotEmpty() API_CORS_ORIGIN: string;
  @IsNotEmpty() API_CORS_METHOD: string;

  @IsNotEmpty() API_CONFIRM_EMAIL_URL: string;
  @IsNotEmpty() API_RESET_PASSWORD_URL: string;
  // ---- Google API ---- //
  @IsNotEmpty() GOOGLE_CLIENT_ID: string;
  @IsNotEmpty() GOOGLE_CLIENT_SECRET: string;
  @IsNotEmpty() GOOGLE_CALLBACK_URL: string;
// ---- Facebook API ---- //
@IsNotEmpty() FACEBOOK_CLIENT_ID: string;
@IsNotEmpty() FACEBOOK_CLIENT_SECRET: string;
@IsNotEmpty() FACEBOOK_CALLBACK_URL: string;
  // ---- Email ---- //
  @IsNotEmpty() EMAIL_HOST: string;
  @IsNotEmpty() @IsNumber() EMAIL_PORT: number;
  @IsNotEmpty() EMAIL_AUTH_USER: string;
  @IsNotEmpty() EMAIL_AUTH_USER_PASSWORD: string;
  @IsNotEmpty() EMAIL_VERIFICATION_TOKEN_SECRET: string;
  @IsNotEmpty()
  @IsNumber()
  EMAIL_VERIFICATION_TOKEN_SECRET_TTL_IN_MINUTES: number;

  // Hàm validate dùng để xác thực một đối tượng cấu hình bằng cách chuyển đổi nó thành một đối tượng của
  // lớp EnvironmentVariablesConfig để kiểm tra xem có phù hợp với các quy tắc được định nghĩa như trên không.
  public static validate(configuration: Record<string, unknown>) {
    const finalConfig = plainToClass(
      EnvironmentVariablesConfig,
      configuration,
      { enableImplicitConversion: true },
    );

    // dùng để kiểm tra xem đối tượng finalConfig có tuân thủ các quy tắc trên không.
    // Nếu có sẽ trả về mảng các lỗi
    const errors = validateSync(finalConfig, { skipMissingProperties: false }); 

    // Kiểm tra xem nếu mảng có trên 0 phần tử có nghĩa là có lỗi và ném ra lỗi
    if (errors.length > 0) throw new Error(errors.toString());

    return finalConfig;
  }
}
