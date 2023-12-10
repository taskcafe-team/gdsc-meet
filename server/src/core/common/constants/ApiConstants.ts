export class ApiConstants {
  static readonly API_REFRESH_TOKEN_TTL_IN_MINUTES = 87660;
  static readonly API_ACCESS_TOKEN_TTL_IN_MINUTES = 30;
  static readonly API_ACCESS_TOKEN_HEADER = "x-api-token";
  static readonly API_SESSION_NAME = "uid";
  static readonly API_COOKIE_HTTPONLY = true;
  static readonly API_COOKIE_SECURE = true;
  static readonly API_CORS_ORIGIN = "*";
  static readonly API_CORS_METHOD = "GET,HEAD,PUT,PATCH,POST,DELETE";
  static readonly API_LOGIN_USERNAME_FIELD = "email";
  static readonly API_LOGIN_PASSWORD_FIELD = "password";
  static readonly API_LOG_ENABLE = true;
  static readonly EMAIL_VERIFICATION_TOKEN_SECRET_TTL_IN_MINUTES = 3;
  static readonly FILE_STORAGE_ENDPOINT = "none";
}
